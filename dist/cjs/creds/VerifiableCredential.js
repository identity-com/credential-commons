'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    const targetLength = currentLength < CivicMerkleProof.PADDING_INCREMENTS ? CivicMerkleProof.PADDING_INCREMENTS : _.ceil(currentLength / CivicMerkleProof.PADDING_INCREMENTS) * CivicMerkleProof.PADDING_INCREMENTS;
    const newNodes = _.clone(nodes);
    while (newNodes.length < targetLength) {
      newNodes.push(new UCA('civ:Random:node', SecureRandom.wordWith(16)));
    }
    return newNodes;
  }

  static getAllAttestableValue(ucas) {
    const values = [];
    _.forEach(ucas, uca => {
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
    _.forEach(ucas, uca => {
      const rootPropertyName = uca.getClaimRootPropertyName();
      if (!this[rootPropertyName]) {
        this[rootPropertyName] = {};
      }
      this[rootPropertyName][uca.getClaimPropertyName()] = uca.getPlainValue();
    });
  }
}
/**
 * Creates a new Verifiable Credential based on an well-known identifier and it's claims dependencies
 * @param {*} identifier 
 * @param {*} issuer 
 * @param {*} ucas 
 * @param {*} version 
 */
function VerifiableCredentialBaseConstructor(identifier, issuer, expiryIn, ucas, version) {
  var _this = this;

  this.id = null;
  this.issuer = issuer;
  const issuerUCA = new UCA('civ:Meta:issuer', this.issuer);
  this.issued = new Date().toISOString();
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

  this.claims = new ClaimModel(ucas);
  this.signature = new CivicMerkleProof(proofUCAs);

  if (!_.isEmpty(definition.excludes)) {
    const removed = _.remove(this.signature.leaves, el => _.includes(definition.excludes, el.identifier));
    _.forEach(removed, r => {
      _.unset(this.claims, r.claimPath);
    });
  }

  /**
   * Returns the global CredentialItemIdentifier of the Credential
   */
  this.getGlobalCredentialItemIdentifier = () => `credential-${this.identifier}-${this.version}`;

  /**
   * Creates a filtered credential exposing only the requested claims
   * @param {*} requestedClaims 
   */
  this.filter = requestedClaims => {
    const filtered = _.cloneDeep(this);
    _.remove(filtered.signature.leaves, el => !_.includes(requestedClaims, el.identifier));

    filtered.claims = {};
    _.forEach(filtered.signature.leaves, el => {
      _.set(filtered.claims, el.claimPath, _.get(this.claims, el.claimPath));
    });

    return filtered;
  };

  /**
   * Request that this credential MerkleRoot is anchored on the Blochain.
   * This will return a _temporary_ anchor meaning that the blockchain entry is still not confirmed.
   * @param {*} options 
   */
  this.requestAnchor = (() => {
    var _ref = _asyncToGenerator(function* (options) {
      const anchor = yield anchorService.anchor(_this.identifier, _this.signature.merkleRoot, options);
      _this.signature.anchor = anchor;
      return _this;
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  })();

  /**
   * Trys to renew the current anchor. replecinf the _temporary_ anchor for a _permanent_ one,
   * already confirmed on the blockchain.
   */
  this.updateAnchor = _asyncToGenerator(function* () {
    const anchor = yield anchorService.update(_this.signature.anchor);
    _this.signature.anchor = anchor;
    return _this;
  });

  return this;
}

module.exports = VerifiableCredentialBaseConstructor;