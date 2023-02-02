"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const {
  findVerificationMethod,
  CachedResolver
} = require('@digitalbazaar/did-io');

const didSol = require('@identity.com/did-io-driver-sol').default;

const resolver = new CachedResolver(); // no payer needed as we are only resolving documents

resolver.use(didSol.driver({
  payer: null
}));
module.exports = {
  /**
   * Checks if a verificationMethod can sign for the DID document
   *
   * @param didOrDocument A DID (string) or DID document (object)
   * @param verificationMethod The verification method to check
   * @returns {Promise<boolean>} True if the verification method can sign
   */
  canSign(didOrDocument, verificationMethod) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const [verificationMethodDid] = verificationMethod.split('#');
      const document = didOrDocument.id ? didOrDocument : yield _this.resolve(didOrDocument);
      const did = document.id; // if the verificationMethod DID is for the document DID

      if (verificationMethodDid === did) {
        return _this.findVerificationMethod(document, verificationMethod) !== null;
      }

      if (!document.controller.includes(verificationMethodDid)) {
        // If the verification method DID is not a controller of the provided DID
        return false;
      } // Check if the verificationMethod exists on the controller DID document


      const controllerDocument = yield _this.resolve(verificationMethodDid);
      return _this.findVerificationMethod(controllerDocument, verificationMethod) !== null;
    })();
  },

  /**
   * Resolves a DID document
   *
   * @param did The DID to resolve the document for
   */
  resolve(did) {
    return _asyncToGenerator(function* () {
      return resolver.get({
        did
      });
    })();
  },

  /**
   * Finds the verificationMethod in a document
   *
   * @param document The document to search through
   * @param verificationMethod The verification method to return
   */
  findVerificationMethod(document, verificationMethod) {
    if (document.keyAgreement && document.keyAgreement.length > 0) {
      return document.keyAgreement.find(agreement => agreement.id === verificationMethod);
    }

    if (!document.capabilityInvocation.includes(verificationMethod)) {
      return null;
    }

    return findVerificationMethod({
      doc: document,
      methodId: verificationMethod
    });
  }

};