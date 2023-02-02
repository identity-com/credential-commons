"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const VerifiableCredential = require('./VerifiableCredential');

const {
  schemaLoader
} = require('../schemas/jsonSchema');

const CredentialSignerVerifier = require('./CredentialSignerVerifier');

const definitions = schemaLoader.credentialDefinitions;
/**
 * Retrieves the credential definition
 * @param {string} identifier - credential identifier
 * @param {*} [version] - definition version
 */

function getCredentialDefinition(identifier, version) {
  const definition = _.find(definitions, {
    identifier
  });

  if (!definition) {
    throw new Error(`Credential definition for ${identifier} v${version} not found`);
  }

  return definition;
}
/**
 * Throws exception if the definition has missing required claims
 * @param {*} definition - the credential definition
 * @param {*} verifiableCredentialJSON - the verifiable credential JSON
 */


function verifyRequiredClaimsFromJSON(definition, verifiableCredentialJSON) {
  const leaves = _.get(verifiableCredentialJSON, 'proof.leaves');

  if (!_.isEmpty(definition.required) && leaves) {
    const identifiers = leaves.map(leave => leave.identifier);

    const missings = _.difference(definition.required, identifiers);

    if (!_.isEmpty(missings)) {
      throw new Error(`Missing required claim(s): ${_.join(missings, ', ')}`);
    }
  }
}

class VerifiableCredentialProxy extends VerifiableCredential {
  get claim() {
    return this.credentialSubject;
  }

  get granted() {
    return this.proof && this.proof.granted ? this.proof.granted : null;
  }

  set granted(granted) {
    this.proof.granted = granted;
  }

  constructor(identifier, issuer, expiryIn, ucas, version, evidence, signerVerifier = null) {
    super(identifier, issuer, expiryIn, null, ucas, evidence, signerVerifier);
    this.version = version;
    /**
     * Returns the old format VC when converting to JSON
     */

    this.toJSON = () => {
      const obj = {
        id: _.clone(this.id),
        identifier: _.clone(this.identifier),
        issuer: _.clone(this.issuer),
        issuanceDate: _.clone(this.issuanceDate),
        expirationDate: _.clone(this.expirationDate),
        version: _.clone(this.version),
        type: ['Credential', this.identifier],
        claim: _.clone(this.credentialSubject),
        proof: _.clone(this.proof)
      };
      if (obj.claim) delete obj.claim.id;
      return obj;
    }; // maintains the old verification process for the older VC format


    this.verifyMerkletreeSignature = pubBase58 => {
      if (_.isEmpty(pubBase58)) return false;
      const verifier = new CredentialSignerVerifier({
        pubBase58
      });
      return verifier.isSignatureValid(this);
    };
  }

}

VerifiableCredentialProxy.create = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (identifier, issuer, expiryIn, ucas, version, evidence, signerVerifier = null) {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    const schema = yield schemaLoader.loadSchemaFromTitle(identifier); // Wrap the old signer verifier for backwards compatibility

    let signer;

    if (signerVerifier) {
      signer = {
        signer: signerVerifier
      };
    } // If it has a credentialSubject, use the new VC format


    if (schema && schema.properties.credentialSubject) {
      return VerifiableCredential.create(identifier, issuer, expiryIn, '', ucas, evidence, signer);
    } // Load the meta schema's from a source


    yield schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
    yield schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
    yield schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
    yield schemaLoader.loadSchemaFromTitle('cvc:Random:node');
    return new VerifiableCredentialProxy(identifier, issuer, expiryIn, ucas, version, evidence, signer);
  });

  return function (_x, _x2, _x3, _x4, _x5, _x6) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Factory function that creates a new Verifiable Credential based on a JSON object.
 *
 * This proxy function ensures that the VC is converted into the new format.
 * @param {*} verifiableCredentialJSON
 * @returns VerifiableCredentialBaseConstructor
 */


VerifiableCredentialProxy.fromJSON = /*#__PURE__*/function () {
  var _ref2 = _asyncToGenerator(function* (verifiableCredentialJSON, partialPresentation = false) {
    const schema = yield schemaLoader.loadSchemaFromTitle(verifiableCredentialJSON.identifier);
    const properties = yield schemaLoader.flattenCredentialSchemaProperties(schema);

    if (properties.credentialSubject) {
      return VerifiableCredential.fromJSON(verifiableCredentialJSON);
    }

    const newObj = yield VerifiableCredentialProxy.create(verifiableCredentialJSON.identifier, verifiableCredentialJSON.issuer);
    newObj.id = _.clone(verifiableCredentialJSON.id);
    newObj.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
    newObj.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
    newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
    newObj.version = _.clone(verifiableCredentialJSON.version);
    newObj.type = ['VerifiableCredential', 'IdentityCredential'];
    newObj.credentialSubject = _.cloneDeep(verifiableCredentialJSON.claim);
    newObj.proof = _.cloneDeep(verifiableCredentialJSON.proof);

    if (!partialPresentation) {
      const definition = getCredentialDefinition(verifiableCredentialJSON.identifier, verifiableCredentialJSON.version);
      verifyRequiredClaimsFromJSON(definition, verifiableCredentialJSON);
    }

    return newObj;
  });

  return function (_x7) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * Non cryptographically secure verify the Credential
 * Performs a proofs verification only.
 *
 * This proxy function ensures that if the VC is provided as a value object, it is correctly converted
 * @param credential - A credential object with expirationDate, claim and proof
 * @return true if verified, false otherwise.
 */


VerifiableCredentialProxy.nonCryptographicallySecureVerify = /*#__PURE__*/function () {
  var _ref3 = _asyncToGenerator(function* (credential) {
    const vc = yield VerifiableCredentialProxy.fromJSON(credential);
    return VerifiableCredential.nonCryptographicallySecureVerify(vc);
  });

  return function (_x8) {
    return _ref3.apply(this, arguments);
  };
}();
/**
 * Cryptographically secure verify the Credential.
 * Performs a non cryptographically secure verification, attestation check and signature validation.
 *
 * This proxy function ensures that if the VC is provided as a value object, it is correctly converted
 * @param credential - A credential object with expirationDate, claim and proof
 * @param verifyAttestationFunc - Async method to verify a credential attestation
 * @param verifySignatureFunc - Async method to verify a credential signature
 * @return true if verified, false otherwise.
 */


VerifiableCredentialProxy.cryptographicallySecureVerify = /*#__PURE__*/function () {
  var _ref4 = _asyncToGenerator(function* (credential, verifyAttestationFunc, verifySignatureFunc) {
    const vc = yield VerifiableCredentialProxy.fromJSON(credential);
    return VerifiableCredential.cryptographicallySecureVerify(vc, verifyAttestationFunc, verifySignatureFunc);
  });

  return function (_x9, _x10, _x11) {
    return _ref4.apply(this, arguments);
  };
}();

VerifiableCredentialProxy.requesterGrantVerify = /*#__PURE__*/function () {
  var _ref5 = _asyncToGenerator(function* (credential, requesterId, requestId, keyName) {
    const vc = yield VerifiableCredentialProxy.fromJSON(credential);
    return VerifiableCredential.requesterGrantVerify(vc, requesterId, requestId, keyName);
  });

  return function (_x12, _x13, _x14, _x15) {
    return _ref5.apply(this, arguments);
  };
}();

module.exports = VerifiableCredentialProxy;