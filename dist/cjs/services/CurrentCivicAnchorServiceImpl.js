'use strict';

/**
 *
 * Request an JWT for the Authorization header
 * 
 * @param {*} http 
 * @param {*} requestBody 
 * @param {*} config 
 */
let getAuthHeader = (() => {
  var _ref = _asyncToGenerator(function* (http, requestBody, config) {
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
      const authResponse = yield http.request(options);
      const extension = getAuthHeaderExtension(http, requestBody, config);

      return Promise.resolve(`Civic ${authResponse.jwt}.${extension}`);
    } catch (error) {
      logger.error('Falied to get a Civic Authorization Header', error);
      return Promise.reject();
    }
  });

  return function getAuthHeader(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Register a new lib/client
 * 
 * @param {*} http 
 * @param {*} config 
 */


let registerClient = (() => {
  var _ref2 = _asyncToGenerator(function* (http) {
    const signingKeys = keyUtils.createKeys();
    const encryptionKeys = keyUtils.createTempECDHKeys();

    const clientConfig = {
      id: uniqueUtils.createClientID(uuid(), SecureRandom.wordWith(16)),
      signingKeys: keyUtils.serializeKeys(signingKeys),
      encryptionKeys: keyUtils.serializeKeys(encryptionKeys)
    };
    const path = '/registry';
    const endpoint = `${process.env.CIVIC_SEC_URL}${path}`;
    logger.debug('clientConfig:', JSON.stringify(clientConfig, null, 2));
    const jwt = jwtUtils.createToken(clientConfig.id, process.env.CIVIC_SEC_URL, clientConfig.id, JWT_EXPIRATION, {
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

      const registration = yield http.request(options);
      logger.debug('Registration succesful:', JSON.stringify(registration, null, 2));
      _.unset(clientConfig, 'encryptionKeys');
      return Promise.resolve(clientConfig);
    } catch (error) {
      logger.error('Falied to register as a client', error);
      return Promise.reject();
    }
  });

  return function registerClient(_x4) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * Civic Anchor/Attester implementation
 * 
 * @param {*} config 
 * @param {*} http 
 */


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
}function CurrentCivicAnchor(config, http) {
  var _this = this;

  this.config = config;
  this.http = http;
  const pollService = (() => {
    var _ref3 = _asyncToGenerator(function* (statusUrl) {
      try {
        const attestation = yield _this.http.request({
          url: statusUrl,
          method: 'GET',
          simple: true,
          json: true
        });

        if (!attestation || !attestation.type) {
          return yield pollService(statusUrl);
        } else if (attestation && attestation.type !== 'permanent') {
          attestation.statusUrl = statusUrl;
          return attestation;
        }
        return attestation;
      } catch (error) {
        logger.error(`Error polling: ${statusUrl}`, JSON.stringify(error, null, 2));
        throw new Error(`Error polling: ${statusUrl}`);
      }
    });

    return function pollService(_x5) {
      return _ref3.apply(this, arguments);
    };
  })();

  this.anchor = (() => {
    var _ref4 = _asyncToGenerator(function* (label, data, options) {
      const opts = options || {};
      const keychain = opts.keychain || _this.config.keychain;
      const passphrase = opts.passphrase || _this.config.passphrase;
      const network = opts.network || _this.config.network || 'testnet';

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
        const endpoint = `${_this.config.attestationService}${path}`;
        const authHeader = yield getAuthHeader(_this.http, attestationRequest, _this.config);

        const requestOptions = {
          url: endpoint,
          headers: { Authorization: authHeader },
          body: attestationRequest,
          method: 'POST',
          json: true,
          simple: true // reject if not 2XX
        };

        let attestation = yield _this.http.request(requestOptions);
        if (!attestation.type) {
          attestation = yield pollService(`${config.attestationService}${attestation.statusUrl}`);
        }
        return attestation;
      } catch (error) {
        logger.error('Error requesting anchor', JSON.stringify(error, null, 2));
        throw new Error('Error requesting anchor');
      }
    });

    return function (_x6, _x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  })();

  this.update = (() => {
    var _ref5 = _asyncToGenerator(function* (tempAnchor) {
      if (tempAnchor.type === 'temporary' && tempAnchor.statusUrl) {
        const attestation = yield pollService(tempAnchor.statusUrl);
        return attestation;
      }
      throw new Error(`Can't update the anchor. type:${tempAnchor.type} statusUrl:${tempAnchor.statusUrl}`);
    });

    return function (_x9) {
      return _ref5.apply(this, arguments);
    };
  })();

  this.verifySignature = signature => {
    return true;
  };

  /**
   * This method checks if the subject signature matches the pub key
   * @param subject a json with label, data, signature, pub
   * @returns {*} true or false for the validation
   */
  this.verifySubjectSignature = subject => {
    return true;
  };

  /**
   * This method checks that the attestation / anchor exists on the BC
   */
  this.verifyAttestation = (() => {
    var _ref6 = _asyncToGenerator(function* (signature) {
      return true;
    });

    return function (_x10) {
      return _ref6.apply(this, arguments);
    };
  })();

  return this;
}

module.exports = {
  registerClient,
  CurrentCivicAnchor
};