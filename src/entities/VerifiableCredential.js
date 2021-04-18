// eslint-disable-next-line max-classes-per-file
const _ = require('lodash');
const timestamp = require('unix-timestamp');
const { v4: uuidv4 } = require('uuid');
const sift = require('sift').default;
const validUrl = require('valid-url');
const MerkleTools = require('merkle-tools');
const flatten = require('flat');
const { CvcMerkleProof } = require('../creds/CvcMerkleProof');
const { Claim } = require('./Claim');
const { AttestableEntity } = require('./AttestableEntity');
const { services } = require('../services');
const time = require('../timeHelper');
const { sha256 } = require('../lib/crypto');

function isDateStructure(obj) {
  const objKeys = _.keys(obj);
  if (objKeys.length !== 3) {
    // it has more or less keys the (day, month, year)
    return false;
  }
  return (_.includes(objKeys, 'day') && _.includes(objKeys, 'month') && _.includes(objKeys, 'year'));
}
function transformDate(obj) {
  return new Date(obj.year, (obj.month - 1), obj.day).getTime() / 1000;
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

const convertDeltaToTimestamp = (delta) => time.applyDeltaToDate(delta).getTime() / 1000;
const convertTimestampIfString = (obj) => (_.isString(obj) ? convertDeltaToTimestamp(obj) : obj);

function verifyLeave(leave, merkleTools, claims, signature, invalidValues, invalidHashs, invalidProofs) {
  // 1. verify valid targetHashs
  // 1.1 "leave.value" should be equal claim values
  const ucaValue = new Claim(leave.identifier, { attestableValue: leave.value });
  if (ucaValue.type === 'string' || ucaValue.type === 'number') {
    if (ucaValue.value !== _.get(claims, leave.claimPath)) {
      invalidValues.push(leave.value);
    }
  } else if (ucaValue.type === 'object') {
    const ucaValueValue = ucaValue.value;
    const innerClaimValue = _.get(claims, leave.claimPath);
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
  } else if (ucaValue.type === 'array') {
    const innerClaimValue = _.get(claims, leave.claimPath);

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

/**
 * Non cryptographically secure verify the Credential
 * Performs a proofs verification only.
 * @param credential - A credential object with expirationDate, claim and proof
 * @return true if verified, false otherwise.
 */
function nonCryptographicallySecureVerify(credential) {
  const expiry = _.clone(credential.expirationDate);
  const claims = _.clone(credential.claim);
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
  _.forEach(_.keys(claimsWithFlatKeys), (claimKey) => {
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
function getLeavesClaimPaths(signLeaves) {
  return _.map(signLeaves, 'claimPath');
}

function getClaimsWithFlatKeys(claims) {
  const flattenDepth3 = flatten(claims, { maxDepth: 3 });
  const flattenDepth2 = flatten(claims, { maxDepth: 2 });
  const flattenClaim = _.merge({}, flattenDepth3, flattenDepth2);
  return _(flattenClaim)
    .toPairs()
    .sortBy(0)
    .fromPairs()
    .value();
}
class VerifiableCredential extends AttestableEntity {
  constructor({
    metadata,
    claims,
    evidence,
  }) {
    const claimValues = {};
    _.forEach(claims, (claim) => {
      const identifier = _.lowerFirst(claim.parsedIdentifier.name.replace(/^[^:]+:/, ''));
      _.set(claimValues, identifier, claim.value);
    });

    const data = _.merge(metadata, { claim: claimValues });

    super(metadata.identifier, data, undefined, undefined, !_.isEmpty(claims));
    if (!_.isEmpty(claims)) {
      const issuanceDateUCA = new Claim('claim-cvc:Meta.issuanceDate-v1', (new Date()).toISOString());
      // TODO: Hardcode expiry date to null
      const expiryUCA = new Claim('claim-cvc:Meta.expirationDate-v1', timestamp.toDate(timestamp.now('1y')).toISOString());
      const issuerUCA = new Claim('claim-cvc:Meta.issuer-v1', metadata.issuer);

      const proofUCAs = _.concat(Object.values(claims), issuerUCA, issuanceDateUCA, expiryUCA);

      this.metadata = metadata;
      this.claims = claims;
      this.proof = new CvcMerkleProof(proofUCAs);

      this.claim = claimValues;

      this.granted = null;
    }

    if (evidence) {
      this.evidence = serializeEvidence(evidence);
    }
  }

  filter(requestedClaims) {
    const filtered = _.cloneDeep(this);
    _.remove(filtered.proof.leaves, (el) => !_.includes(requestedClaims, el.identifier));

    filtered.claim = {};
    _.forEach(filtered.proof.leaves, (el) => {
      _.set(filtered.claim, el.claimPath, _.get(this.claim, el.claimPath));
    });

    return filtered;
  }

  static nonCryptographicallySecureVerify(credential) {
    const expiry = _.clone(credential.expirationDate);
    const claims = _.clone(credential.claim);
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
    _.forEach(_.keys(claimsWithFlatKeys), (claimKey) => {
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

  verifyProofs() {
    return this.nonCryptographicallySecureVerify(this);
  }

  async requestAnchor(options) {
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
  }

  /**
   * Trys to renew the current anchor. replecinf the _temporary_ anchor for a _permanent_ one,
   * already confirmed on the blockchain.
   */
  async updateAnchor() {
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
  }

  async verifyAttestation() {
    // Don't check attestation for credentials that are never attested on blockchain
    if (
      this.proof.anchor.type === 'transient' || this.proof.anchor.network === 'dummynet') {
      return true;
    }

    return services.container.AnchorService.verifyAttestation(this.proof);
  }

  /**
   * This method will revoke the attestation on the chain
   * @returns {Promise<Promise<*>|void>}
   */
  async revokeAttestation() {
    if (this.proof.type === 'transient') {
      return;
    }
    // eslint-disable-next-line consistent-return
    return services.container.AnchorService.revokeAttestation(this.proof);
  }

  isMatch(constraints) {
    const claims = _.cloneDeep(this.claim);
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
  }

  nonCryptographicallySecureVerify(credential) {
    const expiry = _.clone(credential.expirationDate);
    const claims = _.clone(credential.claim);
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
    _.forEach(_.keys(claimsWithFlatKeys), (claimKey) => {
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
  static isMatchCredentialMeta(credentialMeta, constraintsMeta) {
    const siftCompatibleConstraints = transformMetaConstraint(constraintsMeta);

    if (_.isEmpty(siftCompatibleConstraints)) return false;

    const credentialMetaMatchesConstraint = (constraint) => sift(constraint)([credentialMeta]);

    return siftCompatibleConstraints.reduce(
      (matchesAllConstraints, nextConstraint) => matchesAllConstraints && credentialMetaMatchesConstraint(nextConstraint),
      true,
    );
  }

  static fromJSON(verifiableCredentialJSON) {
    // const definition = getCredentialDefinition(verifiableCredentialJSON.identifier,
    //   verifiableCredentialJSON.version);

    // verifyRequiredClaimsFromJSON(definition, verifiableCredentialJSON);
    const newObj = new VerifiableCredential({
      metadata: {
        identifier: verifiableCredentialJSON.identifier,
        issuer: verifiableCredentialJSON.issuer,
      },
    });

    newObj.id = _.clone(verifiableCredentialJSON.id);
    newObj.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
    newObj.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
    // newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
    newObj.version = _.clone(verifiableCredentialJSON.version);
    newObj.type = _.cloneDeep(verifiableCredentialJSON.type);
    newObj.claim = _.cloneDeep(verifiableCredentialJSON.claim);
    newObj.proof = _.cloneDeep(verifiableCredentialJSON.proof);
    newObj.granted = _.clone(verifiableCredentialJSON.granted) || null;

    newObj.validate();

    return newObj;
  }

  /**
   * This method checks if the signature matches for the root of the Merkle Tree
   * @return true or false for the validation
   */
  verifySignature(pinnedPubKey) {
    if (this.proof.anchor.type === 'transient') {
      return true;
    }
    return services.container.AnchorService.verifySignature(this.proof, pinnedPubKey);
  }

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
  grantUsageFor(requestorId, requestId, { keyName, pvtKey }) {
    if (_.isEmpty(_.get(this.proof, 'anchor.subject.label')) || _.isEmpty(_.get(this.proof, 'anchor.subject.data'))) {
      throw new Error('Invalid credential attestation/anchor');
    }
    if (!this.verifySignature()) {
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
    this.granted = hexSign;
  }

  /**
   * Cryptographically secure verify the Credential.
   * Performs a non cryptographically secure verification, attestation check and signature validation.
   * @param credential - A credential object with expirationDate, claim and proof
   * @param verifyAttestationFunc - Async method to verify a credential attestation
   * @param verifySignatureFunc - Async method to verify a credential signature
   * @return true if verified, false otherwise.
   */
  static async cryptographicallySecureVerify(credential, verifyAttestationFunc, verifySignatureFunc) {
    if (!nonCryptographicallySecureVerify(credential)) {
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
   * This method will check on the chain the balance of the transaction and if it's still unspent, than it's not revoked
   * @returns {Promise<Promise<*>|void>}
   */
  async isRevoked() {
    if (this.proof.type === 'transient') {
      return false;
    }
    return services.container.AnchorService.isRevoked(this.proof);
  }
}

VerifiableCredential.Metadata = class {
  constructor({
    id, identifier, issuer, issuanceDate, type, transient = false,
  }) {
    this.id = id || uuidv4();
    this.identifier = identifier;
    this.issuer = issuer;
    this.issuanceDate = issuanceDate || (new Date()).toISOString();
    this.type = type || ['Credential', identifier]; // by default, the type is the identifier
    this.transient = transient;
  }
};

module.exports = { VerifiableCredential };
