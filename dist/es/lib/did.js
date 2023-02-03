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
  async canSign(didOrDocument, verificationMethod) {
    const [verificationMethodDid] = verificationMethod.split('#');
    const document = didOrDocument.id ? didOrDocument : await this.resolve(didOrDocument);
    const did = document.id; // if the verificationMethod DID is for the document DID

    if (verificationMethodDid === did) {
      return this.findVerificationMethod(document, verificationMethod) !== null;
    }

    if (!document.controller.includes(verificationMethodDid)) {
      // If the verification method DID is not a controller of the provided DID
      return false;
    } // Check if the verificationMethod exists on the controller DID document


    const controllerDocument = await this.resolve(verificationMethodDid);
    return this.findVerificationMethod(controllerDocument, verificationMethod) !== null;
  },

  /**
   * Resolves a DID document
   *
   * @param did The DID to resolve the document for
   */
  async resolve(did) {
    return resolver.get({
      did
    });
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