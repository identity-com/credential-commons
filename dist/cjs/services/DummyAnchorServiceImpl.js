"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
  var _this = this;

  this.config = config;
  this.http = http;

  const pollService = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* (statusUrl) {
      try {
        const attestation = yield _this.http.request({
          url: statusUrl,
          method: 'GET',
          simple: true,
          json: true
        });

        if (!attestation || !attestation.type) {
          // eslint-disable-next-line no-unused-vars
          return yield pollService(statusUrl);
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
    });

    return function pollService(_x) {
      return _ref.apply(this, arguments);
    };
  }();

  this.anchor = /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator(function* (options = {}) {
      return Promise.resolve({
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
        tx: new uuid(),
        // eslint-disable-line
        network: 'dummynet',
        type: 'temporary',
        civicAsPrimary: false,
        schema: 'dummy-20180201'
      });
    });

    return function () {
      return _ref2.apply(this, arguments);
    };
  }();

  this.update = /*#__PURE__*/function () {
    var _ref3 = _asyncToGenerator(function* (tempAnchor) {
      // eslint-disable-next-line no-param-reassign
      tempAnchor.type = 'permanent'; // eslint-disable-next-line no-param-reassign

      tempAnchor.value = uuid();
      return Promise.resolve(tempAnchor);
    });

    return function (_x2) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.verifySignature = () => true;
  /**
   * This method checks if the subject signature matches the pub key
   * @returns {*} true or false for the validation
   */


  this.verifySubjectSignature = () => true;
  /**
   * This method checks that the attestation / anchor exists on the BC
   */


  this.verifyAttestation = /*#__PURE__*/_asyncToGenerator(function* () {
    return true;
  });

  this.revokeAttestation = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(function* (signature) {
      // eslint-disable-next-line no-param-reassign
      signature.revoked = true;
      return Promise.resolve(signature);
    });

    return function (_x3) {
      return _ref5.apply(this, arguments);
    };
  }();

  this.isRevoked = signature => signature.revoked ? signature.revoked : false;

  return this;
}

module.exports = {
  CurrentCivicAnchor: DummyAnchorServiceImpl
};