/**
 * Current Anchor/Attester service
 *
 */
const uuid = require('uuid/v4');

const {
  HDNode,
  ECSignature
} = require('bitcoinjs-lib');

const sjcl = require('sjcl');

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

  const pollService = async statusUrl => {
    try {
      const attestation = await this.http.request({
        url: statusUrl,
        method: 'GET',
        simple: true,
        json: true
      });

      if (!attestation || !attestation.type) {
        // eslint-disable-next-line no-unused-vars
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

  this.anchor = async (options = {}) => Promise.resolve({
    subject: {
      pub: 'xpub:dummy',
      label: options.subject && options.subject.label ? options.subject.label : null,
      data: options.subject && options.subject.data ? options.subject.data : null,
      signature: 'signed:dummy'
    },
    walletId: 'none',
    cosigners: [{
      pub: 'xpub:dummy'
    }, {
      pub: 'xpub:dummy'
    }],
    authority: {
      pub: 'xpub:dummy',
      path: '/'
    },
    coin: 'dummycoin',
    tx: uuid(),
    network: 'dummynet',
    type: 'temporary',
    civicAsPrimary: false,
    schema: 'dummy-20180201'
  });

  this.update = async tempAnchor => {
    tempAnchor.type = 'permanent'; // eslint-disable-line

    tempAnchor.value = new uuid(); // eslint-disable-line

    return Promise.resolve(tempAnchor);
  };

  this.verifySignature = (proof, pinnedPubKey) => {
    const {
      subject
    } = proof.anchor;
    const anchorSubjectValidation = this.verifySubjectSignature(subject, pinnedPubKey);
    return anchorSubjectValidation && subject.data === proof.merkleRoot;
  };
  /**
   * This method checks if the subject signature matches the pub key
   * @param subject a json with label, data, signature, pub
   * @returns {*} true or false for the validation
   */


  this.verifySubjectSignature = (subject, pinnedPubKey) => {
    // Do not use JS destruct on the next line, We need to predict the JSON order
    const toHash = JSON.stringify({
      xpub: subject.pub,
      label: subject.label,
      data: subject.data
    });
    const hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(toHash));
    const subjectSignature = ECSignature.fromDER(Buffer.from(subject.signature, 'hex'));
    return HDNode.fromBase58(pinnedPubKey || subject.pub).keyPair.verify(Buffer.from(hash, 'hex'), subjectSignature);
  };
  /**
   * This method checks that the attestation / anchor exists on the BC
   */


  this.verifyAttestation = async (proof, offline = true) => {
    const path = '/proof';
    const endpoint = `${this.config.attestationService}${path}`;
    const requestOptions = {
      url: endpoint,
      body: {
        attestation: proof.anchor,
        offline
      },
      method: 'POST',
      json: true,
      simple: true // reject if not 2XX

    };
    const response = await this.http.request(requestOptions);
    return response.valid;
  };

  this.revokeAttestation = async signature => {
    signature.revoked = true; // eslint-disable-line

    return Promise.resolve(signature);
  };

  this.isRevoked = signature => signature.revoked ? signature.revoked : false;

  return this;
}

module.exports = {
  CurrentCivicAnchor: DummyAnchorServiceImpl
};