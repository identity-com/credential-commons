const _ = require('lodash');
const Merkletools = require('merkle-tools');
const sjcl = require('sjcl');
const definitions = require('./definitions');
const UCA = require('../uca/UserCollectableAttribute');
const SecureRandom = require('../SecureRandom');
const { services } = require('../services');
const timestamp = require('unix-timestamp');

const anchorService = services.container.AnchorService;

function sha256(string) {
  return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(string));
}

function getClaimPath(identifier) {
  const identifierComponentes = _.split(identifier, ':');
  const baseName = _.lowerCase(identifierComponentes[1]);
  return `${baseName}.${identifierComponentes[2]}`;
}

function validIdentifiers() {
  const vi = _.map(definitions, d => d.identifier);
  return vi;
}

/**
 * Transforms a list of UCAs into the signature property of the verifiable cliams
 */
class CivicMerkleProof {
  static get PADDING_INCREMENTS() {
    return 16;
  }

  constructor(ucas) {
    const withRandomUcas = CivicMerkleProof.padTree(ucas);
    this.type = 'CivicMerkleProof2018';
    this.merkleRoot = null;
    this.anchor = 'TBD (Civic Blockchain Attestation)';
    this.leaves = CivicMerkleProof.getAllAttestableValue(withRandomUcas);
    this.buildMerkleTree();
  }

  buildMerkleTree() {
    const merkleTools = new Merkletools();
    const hashes = _.map(this.leaves, n => sha256(n.value));
    merkleTools.addLeaves(hashes);
    merkleTools.makeTree();
    _.forEach(hashes, (hash, idx) => {
      this.leaves[idx].claimPath = getClaimPath(this.leaves[idx].identifier);
      this.leaves[idx].targetHash = hash;
      this.leaves[idx].proof = merkleTools.getProof(idx);
    });
    this.leaves = _.filter(this.leaves, el => !(el.identifier === 'civ:Random:node'));
    this.merkleRoot = merkleTools.getMerkleRoot().toString('hex');
  }

  static padTree(nodes) {
    const currentLength = nodes.length;
    const targetLength = currentLength < CivicMerkleProof.PADDING_INCREMENTS ? CivicMerkleProof.PADDING_INCREMENTS :
      _.ceil(currentLength / CivicMerkleProof.PADDING_INCREMENTS) * CivicMerkleProof.PADDING_INCREMENTS;
    const newNodes = _.clone(nodes);
    while (newNodes.length < targetLength) {
      newNodes.push(new UCA('civ:Random:node', SecureRandom.wordWith(16)));
    }
    return newNodes;
  }

  static getAllAttestableValue(ucas) {
    const values = [];
    _.forEach(ucas, (uca) => {
      const innerValues = uca.getAttestableValues();
      _.reduce(innerValues, (res, iv) => {
        res.push(iv);
        return res;
      }, values);
    });
    return values;
  }
}
/**
 * Transforms a list of UCAs into the claim property of the verifiable cliams
 */
class ClaimModel {
  constructor(ucas) {
    _.forEach(ucas, (uca) => {
      const rootPropertyName = uca.getClaimRootPropertyName();
      if (!this[rootPropertyName]) {
        this[rootPropertyName] = {};
      }
      this[rootPropertyName][uca.getClaimPropertyName()] = uca.getPlainValue();
    });
  }
}

const VERIFY_LEVELS = {
  UNVERIFIED: -1,
  PROOFS: 0,
  ANCHOR: 1,
  BLOCKCHAIN: 2,
};

/**
 * Creates a new Verifiable Credential based on an well-known identifier and it's claims dependencies
 * @param {*} identifier 
 * @param {*} issuer 
 * @param {*} ucas 
 * @param {*} version 
 */
function VerifiableCredentialBaseConstructor(identifier, issuer, expiryIn, ucas, version) {
  this.id = null;
  this.issuer = issuer;
  const issuerUCA = new UCA('civ:Meta:issuer', this.issuer);
  this.issued = (new Date()).toISOString();
  const issuedUCA = new UCA('civ:Meta:issued', this.issued);
  this.identifier = identifier;
  this.expiry = expiryIn ? timestamp.toDate(timestamp.now(expiryIn)).toISOString() : null;
  const expiryUCA = this.expiry ? new UCA('civ:Meta:expiry', this.expiry) : undefined;

  const proofUCAs = expiryUCA ? _.concat(ucas, issuerUCA, issuedUCA, expiryUCA) : _.concat(ucas, issuerUCA, issuedUCA);

  if (!_.includes(validIdentifiers(), identifier)) {
    throw new Error(`${identifier} is not defined`);
  }

  const definition = version ? _.find(definitions, { identifier, version: `${version}` }) : _.find(definitions, { identifier });
  if (!definition) {
    throw new Error(`Credential definition for ${identifier} v${version} not found`);
  }
  this.version = version || definition.version;
  this.type = ['Credential', identifier];

  if (!_.isEmpty(ucas)) {
    this.claims = new ClaimModel(ucas);
    this.signature = new CivicMerkleProof(proofUCAs);
  }

  if (!_.isEmpty(definition.excludes)) {
    const removed = _.remove(this.signature.leaves, el => _.includes(definition.excludes, el.identifier));
    _.forEach(removed, (r) => {
      _.unset(this.claims, r.claimPath);
    });
  }

  /**
   * Returns the global CredentialItemIdentifier of the Credential
   */
  this.getGlobalCredentialItemIdentifier = () => (`credential-${this.identifier}-${this.version}`);

  /**
   * Creates a filtered credential exposing only the requested claims
   * @param {*} requestedClaims 
   */
  this.filter = (requestedClaims) => {
    const filtered = _.cloneDeep(this);
    _.remove(filtered.signature.leaves, el => !_.includes(requestedClaims, el.identifier));

    filtered.claims = {};
    _.forEach(filtered.signature.leaves, (el) => {
      _.set(filtered.claims, el.claimPath, _.get(this.claims, el.claimPath));
    });

    return filtered;
  };

  /**
   * Request that this credential MerkleRoot is anchored on the Blochain.
   * This will return a _temporary_ anchor meaning that the blockchain entry is still not confirmed.
   * @param {*} options 
   */
  this.requestAnchor = async (options) => {
    const anchor = await anchorService.anchor(this.identifier, this.signature.merkleRoot, options);
    this.signature.anchor = anchor;
    return this;
  };

  /**
   * Trys to renew the current anchor. replecinf the _temporary_ anchor for a _permanent_ one,
   * already confirmed on the blockchain.
   */
  this.updateAnchor = async () => {
    const anchor = await anchorService.update(this.signature.anchor);
    this.signature.anchor = anchor;
    return this;
  };

  this.verifyProofs = () => {
    const claims = _.clone(this.claims);
    const signature = _.clone(this.signature);
    let valid = false;

    const merkleTools = new Merkletools();

    // 1. verify valid targetHashs
    const invalidValues = [];
    const invalidHashs = [];
    const invalidProofs = [];
    _.forEach(_.get(signature, 'leaves'), (leave) => {
      // 1.1 "leave.value" should be equal claim values
      const ucaValue = new UCA(leave.identifier, { attestableValue: leave.value });
      if (ucaValue.type === 'String' || ucaValue.type === 'Number') {
        // console.log(`${ucaValue.value} / ${_.get(claims, leave.claimPath)}`);
        if (ucaValue.value !== _.get(claims, leave.claimPath)) invalidValues.push(leave.value);
      } else if (ucaValue.type === 'Object') {
        const ucaValueValue = ucaValue.value;
        const claimValue = _.get(claims, leave.claimPath);
        // console.log(`${JSON.stringify(ucaValueValue)} / ${JSON.stringify(claimValue)}`);
        const ucaValueKeys = _.keys(ucaValue.value);
        _.each(ucaValueKeys, (k) => {
          // console.log(`${ucaValueValue[k].value} / ${claimValue[k]}`);
          if (_.get(ucaValueValue[k], 'value') !== claimValue[k]) invalidValues.push(claimValue[k]);
        });
      } else {
        // Invalid ucaValue.type
        invalidValues.push(leave.value);
      }

      // 1.2 hash(leave.value) should be equal leave.targetHash
      const hash = sha256(leave.value);
      if (hash !== leave.targetHash) invalidHashs.push(invalidHashs);

      // 2. Validate targetHashs + proofs with merkleRoot
      const isValidProof = merkleTools.validateProof(leave.proof, leave.targetHash, signature.merkleRoot);
      // console.log(`leave.proof / ${leave.targetHash} / ${signature.merkleRoot}: ${isValidProof}`);
      if (!isValidProof) invalidProofs.push(leave.targetHash);
    });

    if (_.isEmpty(invalidValues) && _.isEmpty(invalidHashs) && _.isEmpty(invalidProofs)) valid = true;

    return valid;
  };

  /**
   * Verify the Credencial and return a verification level.
   * @return Any of VC.VERIFY_LEVELS
   */
  this.verify = () => {
    let level = VERIFY_LEVELS.UNVERIFIED;
    if (this.verifyProofs()) level = VERIFY_LEVELS.PROOFS;
    return level;
  };

  return this;
}

/**
 * Factory function that creates a new Verifiable Credential based on a JSON object
 * @param {*} verifiableCredentialJSON
 */
VerifiableCredentialBaseConstructor.fromJSON = (verifiableCredentialJSON) => {
  const newObj = new VerifiableCredentialBaseConstructor(verifiableCredentialJSON.identifier);
  newObj.id = _.clone(verifiableCredentialJSON.id);
  newObj.issuer = _.clone(verifiableCredentialJSON.issuer);
  newObj.issued = _.clone(verifiableCredentialJSON.issued);
  newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
  newObj.version = _.clone(verifiableCredentialJSON.version);
  newObj.type = _.cloneDeep(verifiableCredentialJSON.type);
  newObj.claims = _.cloneDeep(verifiableCredentialJSON.claims);
  newObj.signature = _.cloneDeep(verifiableCredentialJSON.signature);
  return newObj;
};

VerifiableCredentialBaseConstructor.VERIFY_LEVELS = VERIFY_LEVELS;

module.exports = VerifiableCredentialBaseConstructor;
