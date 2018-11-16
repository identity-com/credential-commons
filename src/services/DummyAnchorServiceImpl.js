/* eslint no-unused-vars: ["error", { "args": "none" }] */

/**
 * Current Anchor/Attester service
 *
 */
const uuid = require('uuid/v4');
const logger = require('../logger');


/**
 * An Anchor/Attester implementation
 *
 * @param {*} config
 * @param {*} http
 */
function DummyAnchorServiceImpl(config, http) {
  this.config = config;
  this.http = http;
  const pollService = async (statusUrl) => {
    try {
      const attestation = await this.http.request({
        url: statusUrl,
        method: 'GET',
        simple: true,
        json: true,
      });


      if (!attestation || !attestation.type) {
        return await pollService(statusUrl);
      }
      if (attestation && attestation.type !== 'permanent') {
        attestation.statusUrl = statusUrl;
        return attestation;
      }
      return attestation;
    } catch (error) {
      logger.error(`Error polling: ${statusUrl}`, JSON.stringify(error, null, 2));
      throw new Error(`Error polling: ${statusUrl}`);
    }
  };

  this.anchor = async (label, data, options) => (
    Promise.resolve({
      subject: {
        pub: 'xpub:dummy',
        label,
        data,
        signature: 'signed:dummy',
      },
      walletId: 'none',
      cosigners: [{
        pub: 'xpub:dummy',
      }, {
        pub: 'xpub:dummy',
      }],
      authority: {
        pub: 'xpub:dummy',
        path: '/',
      },
      coin: 'dummycoin',
      tx: new uuid(), // eslint-disable-line
      network: 'dummynet',
      type: 'temporary',
      civicAsPrimary: false,
      schema: 'dummy-20180201',
    })
  );

  this.update = async (tempAnchor) => {
    tempAnchor.type = 'permanent'; // eslint-disable-line
    tempAnchor.value = new uuid(); // eslint-disable-line
    return Promise.resolve(tempAnchor);
  };

  this.verifySignature = signature => true;

  /**
   * This method checks if the subject signature matches the pub key
   * @param subject a json with label, data, signature, pub
   * @returns {*} true or false for the validation
   */
  this.verifySubjectSignature = subject => true;

  /**
   * This method checks that the attestation / anchor exists on the BC
   */
  this.verifyAttestation = async signature => true;

  this.revokeAttestation = async (signature) => {
    signature.revoked = true; // eslint-disable-line
    return Promise.resolve(signature);
  };

  this.isRevoked = signature => (signature.revoked ? signature.revoked : false);

  return this;
}

module.exports = {
  CurrentCivicAnchor: DummyAnchorServiceImpl,
};
