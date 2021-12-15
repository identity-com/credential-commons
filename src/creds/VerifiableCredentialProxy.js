const _ = require('lodash');
const VerifiableCredential = require('./VerifiableCredential');
const { schemaLoader } = require('../schemas/jsonSchema');

const definitions = schemaLoader.credentialDefinitions;

/**
 * Retrieves the credential definition
 * @param {string} identifier - credential identifier
 * @param {*} [version] - definition version
 */
function getCredentialDefinition(identifier, version) {
  let definition;
  if (version) {
    definition = _.find(definitions, { identifier, version: `${version}` });
  } else {
    definition = _.find(definitions, { identifier });
  }
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
        proof: _.clone(this.proof),
      };

      if (obj.claim) delete obj.claim.id;

      return obj;
    };
  }
}

VerifiableCredentialProxy.create = async (
  identifier, issuer, expiryIn, ucas, version, evidence, signerVerifier = null,
) => {
  // Load the schema and it's references from a source to be used for validation and defining the schema definitions
  const schema = await schemaLoader.loadSchemaFromTitle(identifier);

  // If it has a credentialSubject, use the new VC format
  if (schema && schema.properties.credentialSubject) {
    return VerifiableCredential.create(identifier, issuer, expiryIn, '', ucas, evidence, signerVerifier);
  }

  // Load the meta schema's from a source
  await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
  await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
  await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
  await schemaLoader.loadSchemaFromTitle('cvc:Random:node');

  return new VerifiableCredentialProxy(identifier, issuer, expiryIn, ucas, version, evidence, signerVerifier);
};

/**
 * Factory function that creates a new Verifiable Credential based on a JSON object.
 *
 * This proxy function ensures that the VC is converted into the new format.
 * @param {*} verifiableCredentialJSON
 * @returns VerifiableCredentialBaseConstructor
 */
VerifiableCredentialProxy.fromJSON = async (verifiableCredentialJSON, partialPresentation = false) => {
  const newObj = await VerifiableCredentialProxy.create(
    verifiableCredentialJSON.identifier,
    verifiableCredentialJSON.issuer,
  );

  newObj.id = _.clone(verifiableCredentialJSON.id);
  newObj.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
  newObj.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
  newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
  newObj.version = _.clone(verifiableCredentialJSON.version);
  newObj.type = [
    'VerifiableCredential',
    'IdentityCredential',
  ];
  newObj.credentialSubject = _.cloneDeep(verifiableCredentialJSON.claim);
  newObj.proof = _.cloneDeep(verifiableCredentialJSON.proof);

  if (!partialPresentation) {
    const definition = getCredentialDefinition(verifiableCredentialJSON.identifier, verifiableCredentialJSON.version);
    verifyRequiredClaimsFromJSON(definition, verifiableCredentialJSON);
  }

  return newObj;
};

/**
 * Non cryptographically secure verify the Credential
 * Performs a proofs verification only.
 *
 * This proxy function ensures that if the VC is provided as a value object, it is correctly converted
 * @param credential - A credential object with expirationDate, claim and proof
 * @return true if verified, false otherwise.
 */
VerifiableCredentialProxy.nonCryptographicallySecureVerify = async (credential) => {
  const vc = await VerifiableCredentialProxy.fromJSON(credential);

  return VerifiableCredential.nonCryptographicallySecureVerify(vc);
};

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
VerifiableCredentialProxy.cryptographicallySecureVerify = async (
  credential, verifyAttestationFunc, verifySignatureFunc,
) => {
  const vc = await VerifiableCredentialProxy.fromJSON(credential);

  return VerifiableCredential.cryptographicallySecureVerify(vc, verifyAttestationFunc, verifySignatureFunc);
};

module.exports = VerifiableCredentialProxy;
