/**
 * Current Civic Anchor/Attester service
 * 
 */
const _ = require('lodash');
const chainauth = require('chainauth');
const { keyUtils, jwtUtils, uniqueUtils, requestUtils } = require('civic-auth-utils');
const SecureRandom = require('../SecureRandom');
const uuid = require('uuid/v4');
const logger = require('../logger');

const JWT_EXPIRATION = '3m';

/* eslint-disable no-unused-vars */
function getAuthHeaderExtension(http, requestBody, config) {
  /* eslint-enable-unused-vars */
  logger.warn('Attestation Service is not checking Civic JWT extension');
  return '';
}

/**
 * Request an JWT for the Authorization header
 * 
 * @param {*} http 
 * @param {*} requestBody 
 * @param {*} config 
 */
async function getAuthHeader(http, requestBody, config) {
  const path = '/jwt';
  const endpoint = `${config.sipSecurityService}${path}`;
  const clientConfig = config.clientConfig;
  logger.debug('clientConfig:', JSON.stringify(clientConfig, null, 2));
  const jwt = jwtUtils.createToken(clientConfig.id, config.sipSecurityService, clientConfig.id, JWT_EXPIRATION, {
    method: 'GET',
    path
  }, clientConfig.signingKeys.hexsec);

  const options = {
    url: endpoint,
    method: 'GET',
    headers: {
      Authorization: `JWT ${jwt}`
    },
    qs: {
      service: 'AttesterService',
      resource: `${config.attestationService}/requestAttestation`,
      method: 'POST'
    },
    json: true,
    simple: true // reject if not 2XX
  };

  try {
    const authResponse = await http.request(options);
    const extension = getAuthHeaderExtension(http, requestBody, config);

    return Promise.resolve(`Civic ${authResponse.jwt}.${extension}`);
  } catch (error) {
    logger.error('Falied to get a Civic Authorization Header', error);
    return Promise.reject();
  }
}

/**
 * Register a new lib/client
 * 
 * @param {*} http 
 * @param {*} config 
 */
async function registerClient(http, config) {
  const signingKeys = keyUtils.createKeys();
  const encryptionKeys = keyUtils.createTempECDHKeys();

  const clientConfig = {
    id: uniqueUtils.createClientID(uuid(), SecureRandom.wordWith(16)),
    signingKeys: keyUtils.serializeKeys(signingKeys),
    encryptionKeys: keyUtils.serializeKeys(encryptionKeys)
  };
  const path = '/registry';
  const endpoint = `${config.sipSecurityService}${path}`;
  logger.debug('clientConfig:', JSON.stringify(clientConfig, null, 2));
  const jwt = jwtUtils.createToken(clientConfig.id, config.sipSecurityService, clientConfig.id, JWT_EXPIRATION, {
    method: 'POST',
    path
  }, clientConfig.signingKeys.hexsec);
  const body = requestUtils.createRegistryObject(signingKeys.sec, clientConfig.id, clientConfig.signingKeys.hexpub, clientConfig.encryptionKeys.hexpub);
  const options = {
    url: endpoint,
    method: 'POST',
    headers: {
      Authorization: `JWT ${jwt}`
    },
    body,
    json: true,
    simple: true // reject if not 2XX
  };

  try {
    logger.debug('Trying to register:', JSON.stringify(options, null, 2));

    const registration = await http.request(options);
    logger.debug('Registration succesful:', JSON.stringify(registration, null, 2));
    _.unset(clientConfig, 'encryptionKeys');
    return Promise.resolve(clientConfig);
  } catch (error) {
    logger.error('Falied to register as a client', error);
    return Promise.reject();
  }
}

/**
 * Civic Anchor/Attester implementation
 * 
 * @param {*} config 
 * @param {*} http 
 */
function CurrentCivicAnchor(config, http) {
  this.config = config;
  this.http = http;
  const pollService = async statusUrl => {
    try {
      const attestation = await this.http.request({
        url: statusUrl,
        method: 'GET',
        simple: true,
        json: true
      });

      if (!attestation || !attestation.type) {
        return await pollService(statusUrl);
      } else if (attestation && attestation.type !== 'permanent') {
        attestation.statusUrl = statusUrl;
        return attestation;
      }
      return attestation;
    } catch (error) {
      logger.error(`Error polling: ${statusUrl}`, JSON.stringify(error, null, 2));
      throw new Error(`Error polling: ${statusUrl}`);
    }
  };

  this.anchor = async (label, data, options) => {
    const opts = options || {};
    const keychain = opts.keychain || this.config.keychain;
    const passphrase = opts.passphrase || this.config.passphrase;
    const network = opts.network || this.config.network || 'testnet';

    if (!keychain) {
      throw new Error('Config Error, missing keychain.');
    }
    if (!passphrase) {
      throw new Error('Config Error, missing passphrase.');
    }

    try {
      const attestationRequest = chainauth.attestationRequest({
        keychain,
        passphrase,
        network,
        label,
        data
      });

      const path = '/requestAttestation';
      const endpoint = `${this.config.attestationService}${path}`;
      const authHeader = await getAuthHeader(this.http, attestationRequest, this.config);

      const requestOptions = {
        url: endpoint,
        headers: { Authorization: authHeader },
        body: attestationRequest,
        method: 'POST',
        json: true,
        simple: true // reject if not 2XX
      };

      let attestation = await this.http.request(requestOptions);
      if (!attestation.type) {
        attestation = await pollService(`${config.attestationService}${attestation.statusUrl}`);
      }
      return attestation;
    } catch (error) {
      logger.error('Error requesting anchor', JSON.stringify(error, null, 2));
      throw new Error('Error requesting anchor');
    }
  };

  this.update = async tempAnchor => {
    if (tempAnchor.type === 'temporary' && tempAnchor.statusUrl) {
      const attestation = await pollService(tempAnchor.statusUrl);
      return attestation;
    }
    throw new Error(`Can't update the anchor. type:${tempAnchor.type} statusUrl:${tempAnchor.statusUrl}`);
  };
  return this;
}

module.exports = {
  registerClient,
  CurrentCivicAnchor
};