import {AbstractProof} from "./Proof";
import {VerifiableCredential} from "../vc/VerifiableCredential";
import {sha256} from "../lib/crypto";
import _ from 'lodash'
import MerkleTools from 'merkle-tools'
import {schemaLoader} from "../schemas/jsonSchema";
import flatten from 'flat';
import {SignerVerifier} from "./CvcMerkleProof/SignerVerifier";

const {Claim} = require('../claim/Claim');
const {services} = require('../services');

function getClaimsWithFlatKeys(claims: any) {
    const flattenDepth3 = flatten(claims, {maxDepth: 3});
    const flattenDepth2 = flatten(claims, {maxDepth: 2});
    const flattenClaim = _.merge({}, flattenDepth3, flattenDepth2);
    return _(flattenClaim)
        .toPairs()
        .sortBy(0)
        .fromPairs()
        .value();
}

function getLeavesClaimPaths(signLeaves: any) {
    return _.map(signLeaves, 'claimPath');
}


function verifyLeave(leave: any, merkleTools: any, claims: any, signature: any, invalidValues: any, invalidHashs: any, invalidProofs: any) {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        claimValue[claimPathSufix] = innerClaimValue;
        const ucaValueKeys = _.keys(ucaValue.value);
        _.each(ucaValueKeys, (k) => {
            const expectedClaimValue = _.get(claimValue, k);
            if (expectedClaimValue && `${_.get(ucaValueValue[k], 'value')}` !== `${expectedClaimValue}`) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
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

export default class CvcMerkleProof extends AbstractProof<void> {
    static get PADDING_INCREMENTS() {
        return 16;
    }

    constructor(private _signerVerifier: SignerVerifier) {
        super();
    }

    static get VERIFY_LEVELS() {
        return {
            INVALID: -1, // Verifies if the VC structure and/or signature proofs is not valid, or credential is expired
            PROOFS: 0, // Verifies if the VC structure  and/or signature proofs are valid, including the expiry
            ANCHOR: 1, // Verifies if the VC Attestation Anchor structure is valid
            GRANTED: 2, // Verifies if the owner granted the VC usage for a specific request
            BLOCKCHAIN: 3, // Verifies if the VC Attestation is valid on the blockchain
        };
    }

    async sign(credential: VerifiableCredential): Promise<VerifiableCredential> {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const withRandomUcas = CvcMerkleProof.padTree(credential.getClaimMeta());
        const leaves = CvcMerkleProof.getAllAttestableValue(withRandomUcas);

        const merkleRoot = await this.buildMerkleTree(leaves);

        const signedCredential = _.clone(credential);
        signedCredential.proof = {
            type: 'CvcMerkleProof2018',
            merkleRoot,
            anchor: 'TBD (Civic Blockchain Attestation)',
            leaves: _.filter(leaves, el => !(el.identifier === 'cvc:Random:node')),
            granted: null,
            merkleRootSignature: undefined
        };

        signedCredential.proof.merkleRootSignature = await this._signerVerifier.sign(signedCredential.proof);

        return signedCredential;
    }

    async verify(credential: VerifiableCredential): Promise<boolean> {
        return await this.verifySignature(credential) && await this.verifyProofs(credential);
    }

    async verifySignature(credential: VerifiableCredential): Promise<boolean> {
        if(!credential.proof.merkleRootSignature) throw new Error("This credential has not been signed");

        return this._signerVerifier.verify(credential);
    }

    async verifyProofs(credential: VerifiableCredential): Promise<boolean> {
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
        await schemaLoader.loadSchemaFromTitle(credential.identifier);

        const expiry = _.clone(credential.expirationDate);
        const claims = _.clone(credential.credentialSubject);
        const signature = _.clone(credential.proof);
        const signLeaves = _.get(signature, 'leaves');
        let valid = false;

        const merkleTools = new MerkleTools({hashType: "sha256"});
        const claimsWithFlatKeys = getClaimsWithFlatKeys(claims);
        const leavesClaimPaths = getLeavesClaimPaths(signLeaves);
        const invalidClaim: any[] = [];
        const invalidExpiry: any[] = [];
        const invalidValues: any[] = [];
        const invalidHashs: any[] = [];
        const invalidProofs: any[] = [];
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
                if (expiry !== null && expiry !== undefined) {
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

    async buildMerkleTree(leaves: any) {
        const merkleTools = new MerkleTools({hashType: "sha256"});
        const hashes = _.map(leaves, n => sha256(n.value));
        merkleTools.addLeaves(hashes);
        merkleTools.makeTree();
        _.forEach(hashes, (hash, idx) => {
            leaves[idx].targetHash = hash;
            leaves[idx].node = merkleTools.getProof(idx);
        });
        leaves = _.filter(leaves, el => !(el.identifier === 'cvc:Random:node'));
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const merkleRoot = merkleTools.getMerkleRoot().toString('hex');

        // if (credentialSigner) {
        //     this.merkleRootSignature = await credentialSigner.sign(this);
        // }
        return merkleRoot;
    }

    static padTree(nodes: any) {
        const currentLength = nodes.length;
        const targetLength = currentLength < CvcMerkleProof.PADDING_INCREMENTS ? CvcMerkleProof.PADDING_INCREMENTS
            : _.ceil(currentLength / CvcMerkleProof.PADDING_INCREMENTS) * CvcMerkleProof.PADDING_INCREMENTS;
        const newNodes = _.clone(nodes);
        const secureRandom = services.container.SecureRandom;
        while (newNodes.length < targetLength) {
            newNodes.push(new Claim('cvc:Random:node', secureRandom.wordWith(16)));
        }
        return newNodes;
    }

    static getAllAttestableValue(ucas: any) {
        let values: any[] = [];
        _.forEach(ucas, (uca) => {
            const innerValues = uca.getAttestableValues();
            values = _.concat(values, innerValues);
        });

        return values;
    }

    static filter(credential: VerifiableCredential, requestedClaims: string[]) {
        const filtered = _.cloneDeep(credential);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _.remove(filtered.proof.leaves, el => !_.includes(requestedClaims, el.identifier));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        filtered.credentialSubject = {};
        _.forEach(filtered.proof.leaves, (el) => {
            _.set(filtered.credentialSubject, el.claimPath, _.get(credential.credentialSubject, el.claimPath));
        });

        return filtered;
    }


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
    static async requestAnchor(credential: VerifiableCredential, options: any) {
        if (credential.transient) {
            // If credential is transient no Blockchain attestation is issued
            credential.proof.anchor = {
                type: 'transient',
                subject: {
                    label: credential.identifier,
                    data: credential.proof.merkleRoot,
                },
            };
            return credential;
        }

        const anchorService = services.container.AnchorService;
        const updatedOption = _.merge({},
            options,
            {
                subject: {
                    label: credential.identifier,
                    data: credential.proof.merkleRoot,
                },
            });
        const anchor = await anchorService.anchor(updatedOption);
        credential.proof.anchor = anchor;
        return credential;
    }

    /**
     * Trys to renew the current anchor. replecinf the _temporary_ anchor for a _permanent_ one,
     * already confirmed on the blockchain.
     */
    static async updateAnchor(credential: VerifiableCredential) {
        // If credential is transient no Blockchain attestation is issued
        if (credential.transient) {
            // If credential is transient no Blockchain attestation is issued
            credential.proof.anchor = {
                type: 'transient',
                subject: {
                    label: credential.identifier,
                    data: credential.proof.merkleRoot,
                },
            };
            return credential;
        }
        const anchorService = services.container.AnchorService;
        const anchor = await anchorService.update(credential.proof.anchor);
        credential.proof.anchor = anchor;
        return credential;
    }

    /**
     * This method checks if the signature matches for the root of the Merkle Tree
     * @return true or false for the validation
     */
    static verifyAnchorSignature = (credential: VerifiableCredential, pinnedPubKey?: string) => {
        if (credential.proof.anchor.type === 'transient') {
            return true;
        }
        return services.container.AnchorService.verifySignature(credential.proof, pinnedPubKey);
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static grantUsageFor = (credential: VerifiableCredential, requestorId: any, requestId: any, {keyName, pvtKey}) => {
        if (_.isEmpty(_.get(credential.proof, 'anchor.subject.label')) || _.isEmpty(_.get(credential.proof, 'anchor.subject.data'))) {
            throw new Error('Invalid credential attestation/anchor');
        }
        if (!CvcMerkleProof.verifyAnchorSignature(credential)) {
            throw new Error('Invalid credential attestation/anchor signature');
        }
        if (!requestorId || !requestId || !(keyName || pvtKey)) {
            throw new Error('Missing required parameter: requestorId, requestId or key');
        }
        // eslint-disable-next-line max-len
        const stringToHash = `${credential.proof.anchor.subject.label}${credential.proof.anchor.subject.data}${requestorId}${requestId}`;
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
        credential.proof.granted = hexSign;
    }

    /**
     * Verify if a credential was granted for a specific requester and requestId.
     * @param credential - A credential object with expirationDate, claim and proof
     * @return true if verified, false otherwise.
     */
    static async verifyGrant(credential: VerifiableCredential, requesterId: any, requestId: any, keyName: any) {
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
     * This method checks that the attestation / anchor exists on the BC
     */
    static async verifyAttestation(credential: VerifiableCredential) {
        // Don't check attestation for credentials that are never attested on blockchain
        if (
            credential.proof.anchor.type === 'transient' || credential.proof.anchor.network === 'dummynet') {
            return true;
        }

        return services.container.AnchorService.verifyAttestation(credential.proof);
    }

    /**
     * This method will revoke the attestation on the chain
     * @returns {Promise<Promise<*>|void>}
     */
    static async revokeAttestation(credential: VerifiableCredential) {
        if (credential.proof.type === 'transient') {
            return;
        }
        // eslint-disable-next-line consistent-return
        return services.container.AnchorService.revokeAttestation(credential.proof);
    }

    /**
     * This method will check on the chain the balance of the transaction and if it's still unspent, than it's not revoked
     * @returns {Promise<Promise<*>|void>}
     */
    static async isRevoked(credential: VerifiableCredential) {
        if (credential.proof.type === 'transient') {
            return false;
        }
        return services.container.AnchorService.isRevoked(credential.proof);
    }


    /**
     * Cryptographically secure verify the Credential.
     * Performs a non cryptographically secure verification, attestation check and signature validation.
     * @param credential - A credential object with expirationDate, claim and proof
     * @param verifyAttestationFunc - Async method to verify a credential attestation
     * @param verifySignatureFunc - Async method to verify a credential signature
     * @return true if verified, false otherwise.
     */
    async cryptographicallySecureVerify(credential: VerifiableCredential, verifyAttestationFunc: any, verifySignatureFunc: any) {
        const nonCryptographicallyVerified = await this.verifyProofs(credential);
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
     * Verify the Credential and return a verification level.
     * @return Any of VC.VERIFY_LEVELS
     * @deprecated
     */
    async verifyLevel(credential: VerifiableCredential, higherVerifyLevel: any, options: any) {
        const {requestorId, requestId, keyName} = options || {};
        const hVerifyLevel = !_.isNil(higherVerifyLevel) ? higherVerifyLevel : CvcMerkleProof.VERIFY_LEVELS.GRANTED;
        let verifiedlevel = CvcMerkleProof.VERIFY_LEVELS.INVALID;

        // Test next level
        if (verifiedlevel === CvcMerkleProof.VERIFY_LEVELS.INVALID
            && hVerifyLevel >= CvcMerkleProof.VERIFY_LEVELS.PROOFS
            && (await this.verifyProofs(credential))) verifiedlevel = CvcMerkleProof.VERIFY_LEVELS.PROOFS;

        // Test next level
        if (verifiedlevel === CvcMerkleProof.VERIFY_LEVELS.PROOFS
            && hVerifyLevel >= CvcMerkleProof.VERIFY_LEVELS.ANCHOR
            && (await CvcMerkleProof.verifyAttestation(credential))) verifiedlevel = CvcMerkleProof.VERIFY_LEVELS.ANCHOR;

        // Test next level
        if (verifiedlevel === CvcMerkleProof.VERIFY_LEVELS.ANCHOR
            && hVerifyLevel >= CvcMerkleProof.VERIFY_LEVELS.GRANTED
            && (await CvcMerkleProof.verifyGrant(credential, requestorId, requestId, keyName))) verifiedlevel = CvcMerkleProof.VERIFY_LEVELS.GRANTED;

        return verifiedlevel;
    };
}
