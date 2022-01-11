const { findVerificationMethod } = require('@digitalbazaar/did-io');
// TODO: Fix the CachedResolver loading issue in jest
const didIo = require('did-io');
const didSol = require('@identity.com/did-io-driver-sol').default;

// no payer needed as we are only resolving documents
didIo.use('sol', didSol.driver({ payer: null }));

module.exports = {
  /**
   * Checks if a verificationMethod can sign for the DID document
   *
   * @param didOrDocument A DID (string) or DID document (object)
   * @param verificationMethod The verification method to check
   * @returns {Promise<boolean>} True if the verification method can sign
   */
  async canSign(didOrDocument, verificationMethod) {
    const [verificationMethodDid] = verificationMethod.split('#');
    const document = didOrDocument.id ? didOrDocument : (await this.resolve(didOrDocument));

    const did = document.id;

    // if the verificationMethod DID is for the document DID
    if (verificationMethodDid === did) {
      return document.capabilityInvocation.includes(verificationMethod);
    }

    if (!document.controller.includes(verificationMethodDid)) {
      // If the verification method DID is not a controller of the provided DID
      return false;
    }

    // Check if the verificationMethod exists on the controller DID document
    const controllerDocument = await this.resolve(verificationMethodDid);
    return controllerDocument.capabilityInvocation.includes(verificationMethod);
  },

  /**
   * Resolves a DID document
   *
   * @param did The DID to resolve the document for
   */
  async resolve(did) {
    return didIo.get({ did });
  },

  /**
   * Finds the verificationMethod in a document (if it exists and is part of the capabilityInvocation)
   *
   * @param document The document to search through
   * @param verificationMethod The verification method to return
   */
  findVerificationMethod(document, verificationMethod) {
    if (!document.capabilityInvocation.includes(verificationMethod)) {
      return null;
    }

    return findVerificationMethod({
      doc: document,
      methodId: verificationMethod,
    });
  },
};
