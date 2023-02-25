// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash';
import validUrl from 'valid-url';
import sift from 'sift';

import timestamp from 'unix-timestamp';
import flatten from 'flat';
import uuidv4 from 'uuid/v4';
import MerkleTools from 'merkle-tools';

import {sha256} from '../lib/crypto';
import {Claim} from '../claim/Claim'
import didUtil from '../lib/did';

import definitions from '../creds/definitions';
import {services} from '../services';
import time from '../timeHelper'
import {CvcMerkleProof} from './CvcMerkleProof';
import {ClaimModel} from './ClaimModel';
import {schemaLoader} from '../schemas/jsonSchema';
import {parseIdentifier} from '../lib/stringUtils';
import * as signerVerifier from '../lib/signerVerifier';
import {IDiDResolver} from "../lib/resolver";

// convert a time delta to a timestamp
const convertDeltaToTimestamp = delta => time.applyDeltaToDate(delta).getTime() / 1000;

function validIdentifiers() {
    const vi = _.map(definitions, d => d.identifier);
    return vi;
}

function getClaimsWithFlatKeys(claims) {
    const flattenDepth3 = flatten(claims, {maxDepth: 3});
    const flattenDepth2 = flatten(claims, {maxDepth: 2});
    const flattenClaim = _.merge({}, flattenDepth3, flattenDepth2);
    return _(flattenClaim)
        .toPairs()
        .sortBy(0)
        .fromPairs()
        .value();
}

function getLeavesClaimPaths(signLeaves) {
    return _.map(signLeaves, 'claimPath');
}

function verifyLeave(leave, merkleTools, claims, signature, invalidValues, invalidHashs, invalidProofs) {
    // 1. verify valid targetHashs
    // 1.1 "leave.value" should be equal claim values
    const ucaValue = new Claim(leave.identifier, {attestableValue: leave.value});
    let providedClaimValue = _.get(claims, leave.claimPath);
    if (!providedClaimValue) providedClaimValue = null;

    if (ucaValue.type === 'String' || ucaValue.type === 'Number') {
        if (ucaValue.value !== providedClaimValue) {
            invalidValues.push(leave.value);
        }
    } else if (ucaValue.type === 'Object') {
        const ucaValueValue = ucaValue.value;
        const innerClaimValue = providedClaimValue;
        const claimPathSufix = _.last(_.split(leave.claimPath, '.'));

        const claimValue = {};
        claimValue[claimPathSufix] = innerClaimValue;
        const ucaValueKeys = _.keys(ucaValue.value);
        _.each(ucaValueKeys, (k) => {
            const expectedClaimValue = _.get(claimValue, k);
            if (expectedClaimValue && `${_.get(ucaValueValue[k], 'value')}` !== `${expectedClaimValue}`) {
                invalidValues.push(claimValue[k]);
            }
        });
    } else if (ucaValue.type === 'Array') {
        const innerClaimValue = providedClaimValue;

        _.forEach(ucaValue.value, (arrayItem, idx) => {
            const itemInnerClaimValue = innerClaimValue[idx];
            const ucaValueKeys = _.keys(arrayItem.value);
            _.each(ucaValueKeys, (k) => {
                const expectedClaimValue = _.get(itemInnerClaimValue, k);
                if (expectedClaimValue && `${_.get(arrayItem.value, [k, 'value'])}` !== `${expectedClaimValue}`) {
                    invalidValues.push(itemInnerClaimValue[k]);
                }
            });
        });
    } else {
        // Invalid ucaValue.type
        invalidValues.push(leave.value);
    }

    // 1.2 hash(leave.value) should be equal leave.targetHash
    const hash = sha256(leave.value);
    if (hash !== leave.targetHash) invalidHashs.push(leave.targetHash);

    // 2. Validate targetHashs + proofs with merkleRoot
    const isValidProof = merkleTools.validateProof(leave.node, leave.targetHash, signature.merkleRoot);
    if (!isValidProof) invalidProofs.push(leave.targetHash);
}

function validateEvidence(evidenceItem) {
    const requiredFields = [
        'type',
        'verifier',
        'evidenceDocument',
        'subjectPresence',
        'documentPresence',
    ];
    _.forEach(requiredFields, (field) => {
        if (!(field in evidenceItem)) {
            throw new Error(`Evidence ${field} is required`);
        }
    });
    // id property is optional, but if present, SHOULD contain a URL
    if (('id' in evidenceItem) && !validUrl.isWebUri(evidenceItem.id)) {
        throw new Error('Evidence id is not a valid URL');
    }
    if (!_.isArray(evidenceItem.type)) {
        throw new Error('Evidence type is not an Array object');
    }
}

function serializeEvidence(evidence) {
    const evidenceList = _.isArray(evidence) ? evidence : [evidence];
    return _.map(evidenceList, (evidenceItem) => {
        validateEvidence(evidenceItem);
        return {
            id: evidenceItem.id,
            type: evidenceItem.type,
            verifier: evidenceItem.verifier,
            evidenceDocument: evidenceItem.evidenceDocument,
            subjectPresence: evidenceItem.subjectPresence,
            documentPresence: evidenceItem.documentPresence,
        };
    });
}

/**
 * Transform DSR constraints to sift constraits
 * @param {*} constraints
 */
function transformConstraint(constraints) {
    const resultConstraints = [];

    _.forEach(constraints.claims, (constraint) => {
        if (!constraint.path) {
            throw new Error('Malformed contraint: missing PATTH');
        }
        if (!constraint.is) {
            throw new Error('Malformed contraint: missing IS');
        }

        const siftConstraint = {};
        siftConstraint[constraint.path] = constraint.is;
        resultConstraints.push(siftConstraint);
    });

    return resultConstraints;
}

/**
 * Checks if object is a Date Structure (has day, month, year properties)
 *
 * @param obj - Structure to test
 * @return {boolean}
 */
function isDateStructure(obj) {
    const objKeys = _.keys(obj);
    if (objKeys.length !== 3) {
        // it has more or less keys the (day, month, year)
        return false;
    }
    return (_.includes(objKeys, 'day') && _.includes(objKeys, 'month') && _.includes(objKeys, 'year'));
}

/**
 * Non cryptographically secure verify the Credential
 * Performs a proofs verification only.
 * @param credential - A credential object with expirationDate, claim and proof
 * @return true if verified, false otherwise.
 */
async function nonCryptographicallySecureVerify(credential) {
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
    await schemaLoader.loadSchemaFromTitle(credential.identifier);

    const expiry = _.clone(credential.expirationDate);
    const claims = _.clone(credential.credentialSubject);
    const signature = _.clone(credential.proof);
    const signLeaves = _.get(signature, 'leaves');
    let valid = false;

    const merkleTools = new MerkleTools();
    const claimsWithFlatKeys = getClaimsWithFlatKeys(claims);
    const leavesClaimPaths = getLeavesClaimPaths(signLeaves);
    const invalidClaim = [];
    const invalidExpiry = [];
    const invalidValues = [];
    const invalidHashs = [];
    const invalidProofs = [];
    _.forEach(_.keys(claimsWithFlatKeys).filter(key => key !== 'id'), (claimKey) => {
        // check if `claimKey` has a `claimPath` proof
        const leaveIdx = _.indexOf(leavesClaimPaths, claimKey);
        // if not found
        if (leaveIdx === -1) {
            // .. still test if parent key node may have a `claimPath` proof
            _.findLastIndex(claimKey, '.');
            const parentClaimKey = claimKey.substring(0, _.lastIndexOf(claimKey, '.'));
            if (_.indexOf(leavesClaimPaths, parentClaimKey) > -1) {
                // if yes, no problem, go to next loop
                return;
            }
            // if no, include on invalidClaim array
            invalidClaim.push(claimKey);
        } else {
            const leave = signLeaves[leaveIdx];
            verifyLeave(leave, merkleTools, claims, signature, invalidValues, invalidHashs, invalidProofs);
        }
    });

    // It has to be present Credential expiry even with null value
    const expiryIdx = _.indexOf(leavesClaimPaths, 'meta.expirationDate');
    if (expiryIdx >= 0) {
        const expiryLeave = signLeaves[expiryIdx];
        const metaClaim = {
            meta: {
                expirationDate: expiry,
            },
        };
        const totalLengthBefore = invalidValues.length + invalidHashs.length + invalidProofs.length;
        verifyLeave(expiryLeave, merkleTools, metaClaim, signature, invalidValues, invalidHashs, invalidProofs);
        const totalLengthAfter = invalidValues.length + invalidHashs.length + invalidProofs.length;
        if (totalLengthAfter === totalLengthBefore) {
            // expiry has always to be string formatted date or null value
            // if it is null it means it's indefinitely
            if (expiry !== null) {
                const now = new Date();
                const expiryDate = new Date(expiry);
                if (now.getTime() > expiryDate.getTime()) {
                    invalidExpiry.push(expiry);
                }
            }
        }
    }
    if (_.isEmpty(invalidClaim)
        && _.isEmpty(invalidValues)
        && _.isEmpty(invalidHashs)
        && _.isEmpty(invalidProofs)
        && _.isEmpty(invalidExpiry)) {
        valid = true;
    }
    return valid;
}

/**
 * Cryptographically secure verify the Credential.
 * Performs a non cryptographically secure verification, attestation check and signature validation.
 * @param credential - A credential object with expirationDate, claim and proof
 * @param verifyAttestationFunc - Async method to verify a credential attestation
 * @param verifySignatureFunc - Async method to verify a credential signature
 * @return true if verified, false otherwise.
 */
async function cryptographicallySecureVerify(credential, verifyAttestationFunc, verifySignatureFunc) {
    const nonCryptographicallyVerified = await nonCryptographicallySecureVerify(credential);
    if (!nonCryptographicallyVerified) {
        return false;
    }

    if (verifyAttestationFunc) {
        const attestationCheck = await verifyAttestationFunc(credential.proof);
        if (!attestationCheck) return false;
    }

    if (verifySignatureFunc) {
        const signatureCheck = await verifySignatureFunc(credential.proof);
        if (!signatureCheck) return false;
    }

    return true;
}

/**
 * Verify if a credential was granted for a specific requester and requestId.
 * @param credential - A credential object with expirationDate, claim and proof
 * @return true if verified, false otherwise.
 */
async function requesterGrantVerify(credential, requesterId, requestId, keyName) {
    const label = _.get(credential.proof, 'anchor.subject.label');
    const anchorPubKey = _.get(credential.proof, 'anchor.subject.pub');
    const anchorData = _.get(credential.proof, 'anchor.subject.data');

    if (_.isEmpty(credential.proof.granted) || _.isEmpty(label) || _.isEmpty(anchorPubKey)) {
        return false;
    }

    const stringToHash = `${label}${anchorData}${requesterId}${requestId}`;
    const hexHash = sha256(stringToHash);

    const cryptoManager = services.container.CryptoManager;

    let verifyKey = keyName;
    if (_.isEmpty(verifyKey)) {
        if (!_.isFunction(cryptoManager.installKey)) {
            throw new Error('CryptoManager does not support installKey, please use a `keyName` instead.');
        }
        verifyKey = `TEMP_KEY_NAME_${new Date().getTime()}`;
        cryptoManager.installKey(verifyKey, anchorPubKey);
    }

    return cryptoManager.verify(verifyKey, hexHash, credential.proof.granted);
}

/**
 * Trasnform {day, month, year } to Unix Date
 *
 * @param obj {day, month, year }
 * @return {number} an unix-timestamp in seconds
 */
function transformDate(obj) {
    return new Date(obj.year, (obj.month - 1), obj.day).getTime() / 1000;
}

const VERIFY_LEVELS = {
    INVALID: -1, // Verifies if the VC structure and/or signature proofs is not valid, or credential is expired
    PROOFS: 0, // Verifies if the VC structure  and/or signature proofs are valid, including the expiry
    ANCHOR: 1, // Verifies if the VC Attestation Anchor structure is valid
    GRANTED: 2, // Verifies if the owner granted the VC usage for a specific request
    BLOCKCHAIN: 3, // Verifies if the VC Attestation is valid on the blockchain
};

/**
 * Throws exception if the definition has missing required claims
 * @param {*} definition - the credential definition
 * @param {*} ucas - the list of ucas
 */
function verifyRequiredClaims(definition, ucas) {
    if (!_.isEmpty(definition.required)) {
        const identifiers = ucas.map(uca => uca.identifier);
        const missings = _.difference(definition.required, identifiers);
        if (!_.isEmpty(missings)) {
            throw new Error(`Missing required claim(s): ${_.join(missings, ', ')}`);
        }
    }
}

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
 * Creates a new Verifiable Credential based on an well-known identifier and it's claims dependencies
 * @param {*} identifier
 * @param {*} issuer
 * @param {*} expiryIn
 * @param {*} subject
 * @param {*} ucas
 * @param {*} [evidence]
 * @param {*} didResolver
 * @param {*} signerOptions
 */
function VerifiableCredentialBaseConstructor(identifier, issuer, expiryIn, subject, ucas, evidence, didResolver, signerOptions) {
    const parsedIdentifier = parseIdentifier(identifier);
    const version = parsedIdentifier ? parsedIdentifier[4] : '1';

    this.id = uuidv4();
    this.issuer = issuer;
    this.issuanceDate = (new Date()).toISOString();
    this.identifier = identifier;
    this.expirationDate = expiryIn ? timestamp.toDate(timestamp.now(expiryIn)).toISOString() : null;

    if (!_.includes(validIdentifiers(), identifier)) {
        throw new Error(`${identifier} is not defined`);
    }

    const definition = getCredentialDefinition(identifier, version);
    // this.version = `${version}` || definition.version;
    this.type = ['VerifiableCredential', 'IdentityCredential'];
    this.transient = definition.transient || false;

    if (evidence) {
        this.evidence = serializeEvidence(evidence);
    }

    this.credentialSubject = {
        id: subject,
    };

    // ucas can be empty here if it is been constructed from JSON
    if (!_.isEmpty(ucas)) {
        verifyRequiredClaims(definition, ucas);
        this.credentialSubject = {
            ...this.credentialSubject,
            ...new ClaimModel(ucas),
        };
        if (!_.isEmpty(definition.excludes)) {
            const removed = _.remove(this.proof.leaves, el => _.includes(definition.excludes, el.identifier));
            _.forEach(removed, (r) => {
                _.unset(this.credentialSubject, r.claimPath);
            });
        }
    }

    /**
     * Returns the global identifier of the Credential
     */
    this.getGlobalIdentifier = () => (`credential-${this.identifier}-${version}`);

    /**
     * Creates a filtered credential exposing only the requested claims
     * @param {*} requestedClaims
     */
    this.filter = (requestedClaims) => {
        const filtered = _.cloneDeep(this);
        _.remove(filtered.proof.leaves, el => !_.includes(requestedClaims, el.identifier));

        filtered.credentialSubject = {};
        _.forEach(filtered.proof.leaves, (el) => {
            _.set(filtered.credentialSubject, el.claimPath, _.get(this.credentialSubject, el.claimPath));
        });

        return filtered;
    };

    /**
     * Request that this credential MerkleRoot is anchored on the Blockchain.
     * This will return a _temporary_ anchor meaning that the blockchain entry is still not confirmed.
     *
     * @param options options to be passed
     * @param options.subject the local signed subject with the user private key
     * @param options.subject.label a short description of the subject
     * @param options.subject.data hash of the merkle root
     * @param options.subject.pub xpub of the signing private key
     * @param options.subject.signature the value of the signature of the private key
     * @param options.network testnet for test env, bitcoin for production
     * @param options.cosigner object containing private and public key for cosigning
     * @param options.cosigner.xpub public key of the cosigner
     * @param options.cosigner.xprv private key of the cosigner
     *
     * @returns the json object containing the whole anchor attestation
     *
     */
    this.requestAnchor = async (options) => {
        if (this.transient) {
            // If credential is transient no Blockchain attestation is issued
            this.proof.anchor = {
                type: 'transient',
                subject: {
                    label: this.identifier,
                    data: this.proof.merkleRoot,
                },
            };
            return this;
        }

        const anchorService = services.container.AnchorService;
        const updatedOption = _.merge({},
            options,
            {
                subject: {
                    label: this.identifier,
                    data: this.proof.merkleRoot,
                },
            });
        const anchor = await anchorService.anchor(updatedOption);
        this.proof.anchor = anchor;
        return this;
    };

    /**
     * Trys to renew the current anchor. replecinf the _temporary_ anchor for a _permanent_ one,
     * already confirmed on the blockchain.
     */
    this.updateAnchor = async () => {
        // If credential is transient no Blockchain attestation is issued
        if (this.transient) {
            // If credential is transient no Blockchain attestation is issued
            this.proof.anchor = {
                type: 'transient',
                subject: {
                    label: this.identifier,
                    data: this.proof.merkleRoot,
                },
            };
            return this;
        }
        const anchorService = services.container.AnchorService;
        const anchor = await anchorService.update(this.proof.anchor);
        this.proof.anchor = anchor;
        return this;
    };

    /**
     * Iterate over all leaves and see if their proofs are valid
     * @returns {boolean}
     */
    this.verifyProofs = () => nonCryptographicallySecureVerify(this);

    /**
     * Verify the Credential and return a verification level.
     * @return Any of VC.VERIFY_LEVELS
     * @deprecated
     */
    this.verify = async (higherVerifyLevel, options) => {
        const {requestorId, requestId, keyName} = options || {};
        const hVerifyLevel = !_.isNil(higherVerifyLevel) ? higherVerifyLevel : VERIFY_LEVELS.GRANTED;
        let verifiedlevel = VERIFY_LEVELS.INVALID;

        // Test next level
        if (verifiedlevel === VERIFY_LEVELS.INVALID
            && hVerifyLevel >= VERIFY_LEVELS.PROOFS
            && (await this.verifyProofs())) verifiedlevel = VERIFY_LEVELS.PROOFS;

        // Test next level
        if (verifiedlevel === VERIFY_LEVELS.PROOFS
            && hVerifyLevel >= VERIFY_LEVELS.ANCHOR
            && this.verifyAttestation()) verifiedlevel = VERIFY_LEVELS.ANCHOR;

        // Test next level
        if (verifiedlevel === VERIFY_LEVELS.ANCHOR
            && hVerifyLevel >= VERIFY_LEVELS.GRANTED
            && this.verifyGrant(requestorId, requestId, keyName)) verifiedlevel = VERIFY_LEVELS.GRANTED;

        return verifiedlevel;
    };

    /**
     * This method checks if the signature matches for the root of the Merkle Tree
     * @return true or false for the validation
     */
    this.verifyAnchorSignature = (pinnedPubKey) => {
        if (this.proof.anchor.type === 'transient') {
            return true;
        }
        return services.container.AnchorService.verifySignature(this.proof, pinnedPubKey);
    };

    /**
     * This methods check the stand alone merkletreeSiganture
     * return true or false for the validation
     */
    this.verifyMerkletreeSignature = async () => {
        // This check is required to support older non-w3c VC formats (TODO: Consider removing IDCOM-2323)
        if(signerOptions && signerOptions.verificationMethod) {
            // If the issuer can't sign they can't verify
            const canSign = await didUtil.canSign(this.issuer, signerOptions.verificationMethod, didResolver);
            if (!canSign) return false;
        }


        if(signerOptions && signerOptions.signer && signerOptions.signer.verify) {
            return signerOptions.signer.verify(this);
        }

        // TODO: defaults to the "built-in" verifier (will be removed with IDCOM-2323)
        const verifier = await signerVerifier.verifier(
            this.issuer,
            this.proof.merkleRootSignature.verificationMethod,
            didResolver
        );

        return verifier.verify(this);
    };

    /**
     * This method checks that the attestation / anchor exists on the BC
     */
    this.verifyAttestation = async () => {
        // Don't check attestation for credentials that are never attested on blockchain
        if (
            this.proof.anchor.type === 'transient' || this.proof.anchor.network === 'dummynet') {
            return true;
        }

        return services.container.AnchorService.verifyAttestation(this.proof);
    };

    /**
     * This method will revoke the attestation on the chain
     * @returns {Promise<Promise<*>|void>}
     */
    this.revokeAttestation = async () => {
        if (this.proof.type === 'transient') {
            return;
        }
        // eslint-disable-next-line consistent-return
        return services.container.AnchorService.revokeAttestation(this.proof);
    };

    /**
     * This method will check on the chain the balance of the transaction and if it's still unspent, than it's not revoked
     * @returns {Promise<Promise<*>|void>}
     */
    this.isRevoked = async () => {
        if (this.proof.type === 'transient') {
            return false;
        }
        return services.container.AnchorService.isRevoked(this.proof);
    };

    const convertTimestampIfString = obj => (_.isString(obj) ? convertDeltaToTimestamp(obj) : obj);

    this.isMatch = (constraints) => {
        const claims = _.cloneDeep(this.credentialSubject);
        const siftCompatibleConstraints = transformConstraint(constraints);

        const claimsMatchConstraint = (constraint) => {
            const path = _.keys(constraint)[0];
            const pathValue = _.get(claims, path);
            if (isDateStructure(pathValue)) {
                _.set(claims, path, transformDate(pathValue));
                // transforms delta values like "-18y" to a proper timestamp
                _.set(constraint, path, _.mapValues(constraint[path], convertTimestampIfString));
            }
            // The Constraints are ANDed here - if one is false, the entire
            return sift(constraint)([claims]);
        };

        return siftCompatibleConstraints.reduce(
            (matchesAllConstraints, nextConstraint) => matchesAllConstraints && claimsMatchConstraint(nextConstraint),
            true,
        );
    };

    /**
     * Updates the credential with a "granted" token based on the requestorId and a unique requestId (a nonce) that
     * can be verified later using .verify() function.
     *
     * @param  {string} requestorId - The IDR id (DID).
     * @param  {string} requestId - A unique requestID. This should be a nonce for proof chanlange.
     * @param  {Object} option - You should provide either a keyName or a pvtKey.
     * @param  {string} option.keyName - A keyName - if CryptoManager is been used.
     * @param  {string} option.pvtKey - A pvtKey in base58 format (default impl).
     */
    this.grantUsageFor = (requestorId, requestId, {keyName, pvtKey}) => {
        if (_.isEmpty(_.get(this.proof, 'anchor.subject.label')) || _.isEmpty(_.get(this.proof, 'anchor.subject.data'))) {
            throw new Error('Invalid credential attestation/anchor');
        }
        if (!this.verifyAnchorSignature()) {
            throw new Error('Invalid credential attestation/anchor signature');
        }
        if (!requestorId || !requestId || !(keyName || pvtKey)) {
            throw new Error('Missing required parameter: requestorId, requestId or key');
        }
        // eslint-disable-next-line max-len
        const stringToHash = `${this.proof.anchor.subject.label}${this.proof.anchor.subject.data}${requestorId}${requestId}`;
        const hexHash = sha256(stringToHash);

        const cryptoManager = services.container.CryptoManager;

        let signKey = keyName;
        if (pvtKey) {
            if (!_.isFunction(cryptoManager.installKey)) {
                throw new Error('You provide a `pvtKey` but the CryptoManager does not support it, use a `keyName` instead.');
            }
            signKey = `TEMP_KEY_NAME_${new Date().getTime()}`;
            cryptoManager.installKey(signKey, pvtKey);
        }

        const hexSign = cryptoManager.sign(signKey, hexHash);
        this.proof.granted = hexSign;
    };

    /**
     * Serializes the VerifiableCredential to a JSON string
     * @param space The number of spaces to indent the JSON with
     */
    this.toJSON = () => {
        const obj = _.pick(this, [
            'id',
            'identifier',
            'issuer',
            'issuanceDate',
            'expirationDate',
            'type',
            'credentialSubject',
            'proof',
        ]);

        // Remove undefined/null values
        // eslint-disable-next-line no-restricted-syntax
        for (const k in obj) {
            if (obj[k] === null || obj[k] === undefined) {
                delete obj[k];
            }
        }

        return {
            '@context': [
                'https://www.w3.org/2018/credentials/v1',
                `https://www.identity.com/credentials/v${version}`,
            ],
            ...obj,
        };
    };
    /**
     * @param  {} requestorId
     * @param  {} requestId
     * @param  {} [keyName]
     */
    this.verifyGrant = (requesterId, requestId, keyName) => requesterGrantVerify(this, requesterId, requestId, keyName);

    return this;
}

/**
 * CREDENTIAL_META_FIELDS - Array with meta fields of a credential
 */
const CREDENTIAL_META_FIELDS = [
    'id',
    'identifier',
    'issuer',
    'issuanceDate',
    'expirationDate',
    'type',
];

/**
 *
 * @param {*} vc
 */
const getCredentialMeta = vc => _.pick(vc, CREDENTIAL_META_FIELDS);

/**
 * Sift constraints to throw errors for constraints missing IS
 * @param {*} constraintsMeta
 * @param Array
 */
function transformMetaConstraint(constraintsMeta) {
    const resultConstraints = [];

    // handle special field constraints.meta.credential
    const constraintsMetaKeys = _.keys(constraintsMeta.meta);
    _.forEach(constraintsMetaKeys, (constraintKey) => {
        const constraint = constraintsMeta.meta[constraintKey];
        const siftConstraint = {};
        // handle special field constraints.meta.credential
        if (constraintKey === 'credential') {
            siftConstraint.identifier = constraint;
        } else if (constraint.is) {
            siftConstraint[constraintKey] = constraint.is;
        } else {
            throw new Error(`Malformed meta constraint "${constraintKey}": missing the IS`);
        }
        resultConstraints.push(siftConstraint);
    });
    return resultConstraints;
}

/**
 * isMatchCredentialMeta
 * @param {*} credentialMeta An Object contains only VC meta fields. Other object keys will be ignored.
 * @param {*} constraintsMeta Example:
 * // constraints.meta = {
 * //   "credential": "credential-civ:Credential:CivicBasic-1",
 * //   "issuer": {
 * //     "is": {
 * //       "$eq": "did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD"
 * //     }
 * //   }
 * @returns boolean
 */
const isMatchCredentialMeta = (credentialMeta, constraintsMeta) => {
    const siftCompatibleConstraints = transformMetaConstraint(constraintsMeta);

    if (_.isEmpty(siftCompatibleConstraints)) return false;

    const credentialMetaMatchesConstraint = constraint => sift(constraint)([credentialMeta]);

    return siftCompatibleConstraints.reduce(
        (matchesAllConstraints, nextConstraint) => matchesAllConstraints && credentialMetaMatchesConstraint(nextConstraint),
        true,
    );
};

VerifiableCredentialBaseConstructor.CREDENTIAL_META_FIELDS = CREDENTIAL_META_FIELDS;
VerifiableCredentialBaseConstructor.getCredentialMeta = getCredentialMeta;
VerifiableCredentialBaseConstructor.isMatchCredentialMeta = isMatchCredentialMeta;

/**
 * Creates a Verifiable Credential
 *
 * @param identifier The identifier for the VC (e.g. credential-cvc:Identity-v1)
 * @param issuerDid The issuer DID
 * @param expiryIn The credential expiry date (nullable)
 * @param subject The subject DID
 * @param ucas An array of UCAs
 * @param evidence The evidence for the credential
 * @param resolver The did resolver to use
 * @param signerOptions Signer options:
 * @param signerOptions.verificationMethod The verificationMethod for the signing key
 * @param signerOptions.keypair The keypair to sign with
 *    or
 * @param signerOptions.privateKey The private key to sign with
 *    or
 * @param signerOptions.signer An object implementing a `sign(CvcMerkleProof)` method
 */
VerifiableCredentialBaseConstructor.create = async (identifier,
                                                    issuerDid,
                                                    expiryIn,
                                                    subject,
                                                    ucas,
                                                    evidence,
                                                    signerOptions = null,
                                                    resolver: IDiDResolver = didUtil,
                                                    validate = true
) => {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    await schemaLoader.loadSchemaFromTitle(identifier);

    // Load the meta schema's from a source
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
    await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
    await schemaLoader.loadSchemaFromTitle('cvc:Random:node');

    if (signerOptions) {
        const canSignForIssuer = await didUtil.canSign(issuerDid, signerOptions.verificationMethod, resolver);
        if (!canSignForIssuer) {
            throw new Error(
                `The verificationMethod ${signerOptions.verificationMethod} is not allowed to sign for ${issuerDid}`,
            );
        }

        // eslint-disable-next-line no-param-reassign
        signerOptions.signer = await signerVerifier.signer(signerOptions, resolver);
    }

    const vc = new VerifiableCredentialBaseConstructor(
        identifier, issuerDid, expiryIn, subject, ucas, evidence, resolver, signerOptions,
    );

    const issuerUCA = new Claim('cvc:Meta:issuer', vc.issuer);
    const expiryUCA = new Claim('cvc:Meta:expirationDate', vc.expirationDate ? vc.expirationDate : 'null');
    const issuanceDateUCA = new Claim('cvc:Meta:issuanceDate', vc.issuanceDate);
    const proofUCAs = expiryUCA ? _.concat(ucas ? ucas : [], issuerUCA, issuanceDateUCA, expiryUCA)
        : _.concat(ucas, issuerUCA, issuanceDateUCA);
    vc.proof = new CvcMerkleProof(proofUCAs);
    await vc.proof.buildMerkleTree(signerOptions ? signerOptions.signer : null)

    if (validate) {
        await schemaLoader.validateSchema(identifier, vc.toJSON());
    }

    return vc;
};

/**
 * Factory function that creates a new Verifiable Credential based on a JSON object
 * @param {*} verifiableCredentialJSON
 * @returns VerifiableCredentialBaseConstructor
 */
VerifiableCredentialBaseConstructor.fromJSON = async (verifiableCredentialJSON, partialPresentation = false) => {
    await schemaLoader.loadSchemaFromTitle(verifiableCredentialJSON.identifier);

    if (!partialPresentation) {
        await schemaLoader.validateSchema(verifiableCredentialJSON.identifier, verifiableCredentialJSON);
    }

    const newObj = await VerifiableCredentialBaseConstructor.create(
        verifiableCredentialJSON.identifier,
        verifiableCredentialJSON.issuer,
    );

    newObj.id = _.clone(verifiableCredentialJSON.id);
    newObj.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
    newObj.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
    newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
    newObj.type = _.cloneDeep(verifiableCredentialJSON.type);
    newObj.credentialSubject = _.cloneDeep(verifiableCredentialJSON.credentialSubject);
    newObj.proof = _.cloneDeep(verifiableCredentialJSON.proof);

    return newObj;
};


/**
 * List all properties of a Verifiable Credential
 */
VerifiableCredentialBaseConstructor.getAllProperties = async (identifier) => {
    await schemaLoader.loadSchemaFromTitle(identifier);

    const vcDefinition = _.find(definitions, {identifier});
    if (vcDefinition) {
        const allProperties = await vcDefinition.depends.reduce(async (prev, definition) => {
            const prevProps = await prev;
            const claimProps = await Claim.getAllProperties(definition);

            return [...prevProps, ...claimProps];
        }, Promise.resolve([]));

        let excludesProperties = [];
        if (vcDefinition.excludes) {
            excludesProperties = await vcDefinition.excludes.reduce(async (prev, definition) => {
                const prevProps = await prev;
                const claimProps = await Claim.getAllProperties(definition);

                return [...prevProps, ...claimProps];
            }, Promise.resolve([]));
        }

        return _.difference(allProperties, excludesProperties);
    }
    return null;
};

VerifiableCredentialBaseConstructor.VERIFY_LEVELS = VERIFY_LEVELS;
VerifiableCredentialBaseConstructor.nonCryptographicallySecureVerify = nonCryptographicallySecureVerify;
VerifiableCredentialBaseConstructor.cryptographicallySecureVerify = cryptographicallySecureVerify;
VerifiableCredentialBaseConstructor.requesterGrantVerify = requesterGrantVerify;

export = VerifiableCredentialBaseConstructor;
