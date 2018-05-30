import _ from 'lodash';
import Merkletools from 'merkle-tools';
import sjcl from 'sjcl';
import definitions from './definitions';
import UCA from '../uca/UserCollectableAttribute';
import SecureRandon from '../SecureRandom';

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
    this.leaves = _.filter(this.leaves, el => !(el.identifier === 'civ:Randon:node'));
    this.merkleRoot = merkleTools.getMerkleRoot().toString('hex');
  }

  static padTree(nodes) {
    const currentLength = nodes.length;
    const targetLength = currentLength < CivicMerkleProof.PADDING_INCREMENTS ? CivicMerkleProof.PADDING_INCREMENTS : _.ceil(currentLength / CivicMerkleProof.PADDING_INCREMENTS) * CivicMerkleProof.PADDING_INCREMENTS;
    const newNodes = _.clone(nodes);
    while (newNodes.length < targetLength) {
      newNodes.push(new UCA('civ:Randon:node', SecureRandon.wordWith(16)));
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

class ClaimModel {
  constructor(ucas) {
    _.forEach(ucas, (uca) => {
      const rootPropertyName = uca.getClaimRootPropertyName();
      if (!this[rootPropertyName]) {
        this[rootPropertyName] = {};
      }
      this[rootPropertyName][uca.getClaimPropertyName()] = uca.getPretyValue();
    });
  }
}


function VerifiableCredentialBaseConstructor(identifier, issuer, ucas, version) {
  this.id = null;
  this.issuer = issuer;
  this.issued = (new Date()).toISOString();

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
  this.signature = new CivicMerkleProof(ucas);

  if (!_.isEmpty(definition.excludes)) {
    const removed = _.remove(this.signature.leaves, el => _.includes(definition.excludes, el.identifier));
    _.forEach(removed, (r) => {
      _.unset(this.claims, r.claimPath);
    });
  }


  return this;
}

export default VerifiableCredentialBaseConstructor;
