// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash'
import VerifiableCredential from './VerifiableCredential'
import {schemaLoader} from '../schemas/jsonSchema'
import CredentialSignerVerifier from './CredentialSignerVerifier';
import {IDiDResolver} from "../lib/resolver";
import {CvcMerkleProof} from "./CvcMerkleProof";
import {Claim} from "../claim/Claim";

const definitions = schemaLoader.credentialDefinitions;

/**
 * Retrieves the credential definition
 * @param {string} identifier - credential identifier
 * @param {*} [version] - definition version
 */
function getCredentialDefinition(identifier, version) {
    const definition = _.find(definitions, {identifier});

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

    constructor(identifier,
                issuer,
                expiryIn,
                ucas,
                version,
                evidence,
                signerVerifier = null,
                didResolver: IDiDResolver = undefined
    ) {
        super(identifier, issuer, expiryIn, null, ucas, evidence, undefined, signerVerifier, didResolver);

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

        // maintains the old verification process for the older VC format
        this.verifyMerkletreeSignature = (pubBase58) => {
            if (_.isEmpty(pubBase58)) return false;
            const verifier = new CredentialSignerVerifier({pubBase58});
            return verifier.isSignatureValid(this);
        };
    }
}

VerifiableCredentialProxy.create = async (
    identifier, issuer, expiryIn, ucas, version, evidence, signerVerifier = null,
) => {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    const schema = await schemaLoader.loadSchemaFromTitle(identifier);

    // Wrap the old signer verifier for backwards compatibility
    let signer;
    if (signerVerifier) {
        signer = {signer: signerVerifier};
    }

    // If it has a credentialSubject, use the new VC format
    if (schema && schema.properties.credentialSubject) {
        return VerifiableCredential.create(identifier, issuer, expiryIn, '', ucas, evidence, signer);
    }

    // Load the meta schema's from a source
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
    await schemaLoader.loadSchemaFromTitle('cvc:Random:node');

    const vc = new VerifiableCredentialProxy(identifier, issuer, expiryIn, ucas, version, evidence, signer);

    const issuerUCA = new Claim('cvc:Meta:issuer', vc.issuer);
    const expiryUCA = new Claim('cvc:Meta:expirationDate', vc.expirationDate ? vc.expirationDate : 'null');
    const issuanceDateUCA = new Claim('cvc:Meta:issuanceDate', vc.issuanceDate);
    const proofUCAs = expiryUCA ? _.concat(ucas ? ucas : [], issuerUCA, issuanceDateUCA, expiryUCA)
        : _.concat(ucas, issuerUCA, issuanceDateUCA);
    vc.proof = new CvcMerkleProof(proofUCAs);
    await vc.proof.buildMerkleTree(signerVerifier);

    return vc;
};

/**
 * Factory function that creates a new Verifiable Credential based on a JSON object.
 *
 * This proxy function ensures that the VC is converted into the new format.
 * @param {*} verifiableCredentialJSON
 * @returns VerifiableCredentialBaseConstructor
 */
VerifiableCredentialProxy.fromJSON = async (verifiableCredentialJSON, partialPresentation = false) => {
    const schema = await schemaLoader.loadSchemaFromTitle(verifiableCredentialJSON.identifier);
    const properties = await schemaLoader.flattenCredentialSchemaProperties(schema);
    if (properties.credentialSubject) {
        return VerifiableCredential.fromJSON(verifiableCredentialJSON);
    }

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

VerifiableCredentialProxy.requesterGrantVerify = async (credential, requesterId, requestId, keyName) => {
    const vc = await VerifiableCredentialProxy.fromJSON(credential);
    return VerifiableCredential.requesterGrantVerify(vc, requesterId, requestId, keyName);
};

export = VerifiableCredentialProxy;
