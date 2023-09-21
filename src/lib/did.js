const VERIFICATION_RELATIONSHIPS = new Set([
  'assertionMethod',
  'authentication',
  'capabilityDelegation',
  'capabilityInvocation',
  'keyAgreement',
]);

function methodById({ doc, methodId }) {
  // First, check the 'verificationMethod' bucket, see if it's listed there
  if (doc.verificationMethod) {
    const result = doc.verificationMethod.find((method) => method.id === methodId);
    if (result) return result;
  }

  return VERIFICATION_RELATIONSHIPS.find((purpose) => {
    const methods = doc[purpose] || [];
    // Iterate through each verification method in 'authentication', etc.
    // Only return it if the method is defined, not referenced
    return methods.find((method) => typeof method === 'object' && method.id === methodId);
  });
}

/**
 * Finds a verification method for a given id and returns it.
 *
 * @param {object} options - Options hashmap.
 * @param {object} options.doc - DID Document.
 *
* */
function findVerificationMethod({ doc, methodId, purpose } = {}) {
  if (!doc) {
    throw new TypeError('A DID Document is required.');
  }
  if (!(methodId || purpose)) {
    throw new TypeError('A method id or purpose is required.');
  }

  if (methodId) {
    return methodById({ doc, methodId });
  }

  // Id not given, find the first method by purpose
  const [method] = doc[purpose] || [];
  if (method && typeof method === 'string') {
    // This is a reference, not the full method, attempt to find it
    return methodById({ doc, methodId: method });
  }

  return method;
}

module.exports = {
  cachedResolver: null,
  setResolver(resolver) {
    this.cachedResolver = { get: resolver };
  },
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
      return this.findVerificationMethod(document, verificationMethod) !== null;
    }

    if (!document.controller.includes(verificationMethodDid)) {
      // If the verification method DID is not a controller of the provided DID
      return false;
    }

    // Check if the verificationMethod exists on the controller DID document
    const controllerDocument = await this.resolve(verificationMethodDid);
    return this.findVerificationMethod(controllerDocument, verificationMethod) !== null;
  },

  /**
   * Resolves a DID document
   *
   * @param did The DID to resolve the document for
   */
  async resolve(did) {
    return this.cachedResolver.get(did);
  },

  /**
   * Finds the verificationMethod in a document
   *
   * @param document The document to search through
   * @param verificationMethod The verification method to return
   */
  findVerificationMethod(document, verificationMethod) {
    if (document.keyAgreement && document.keyAgreement.length > 0) {
      return document.keyAgreement.find((agreement) => agreement.id === verificationMethod);
    }

    if (!document.capabilityInvocation.includes(verificationMethod)) {
      return null;
    }

    return findVerificationMethod({
      doc: document,
      methodId: verificationMethod,
    });
  },
};
