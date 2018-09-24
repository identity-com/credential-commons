/**
 * Current Civic Anchor/Attester service
 * 
 */
const _ = require('lodash');
const SecureRandom = require('../SecureRandom');
const uuid = require('uuid/v4');
const logger = require('../logger');


/**
 * Civic Anchor/Attester implementation
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
    return await Promise.resolve({
        "subject": {
          "pub": "unsigned",
          "label": label,
          "data": data,
          "signature": "unsigned"
        },
        "walletId": "none",
        "cosigners": [{
          "pub": "unsigned"
        }, {
          "pub": "unsigned"
        }],
        "authority": {
          "pub": "unsigned",
          "path": "/"
        },
        "coin": "dummy",
        "tx": new uuid(),
        "network": "dummy",
        "type": "temporary",
        "civicAsPrimary": false,
        "schema": "dummy-20180201"
      });
  };

  this.update = async (tempAnchor) => {
    tempAnchor.type = "permanent";
    tempAnchor.value = new uuid();
    return await Promise.resolve(tempAnchor);
  };

  this.verifySignature = (signature) => {
    return true;
  };

  /**
   * This method checks if the subject signature matches the pub key
   * @param subject a json with label, data, signature, pub
   * @returns {*} true or false for the validation
   */
  this.verifySubjectSignature = (subject) => {
    return true;
  };

  /**
   * This method checks that the attestation / anchor exists on the BC
   */
  this.verifyAttestation = async (signature) => {
    return true;
  };

  this.revokeAttestation =  async (signature) => {
    signature.revoked = true;
    return await Promise.resolve(signature);
  };

  this.isRevoked = (signature) => {
      return signature.revoked ? signature.revoked : false;
  }

  return this;
}

module.exports = {
  CurrentCivicAnchor: DummyAnchorServiceImpl,
}
;
