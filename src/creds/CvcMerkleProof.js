const _ = require('lodash');
const MerkleTools = require('merkle-tools');

const { sha256 } = require('../lib/crypto');
const { Claim } = require('../claim/Claim');
const claimDefinitions = require('../claim/definitions');
const { services } = require('../services');

function getClaimPath(identifier, claimsPathRef) {
  const sufix = Claim.getPath(identifier);
  let claimPath = _.find(claimsPathRef, (o) => _.endsWith(o, sufix));
  if (!claimPath) {
    const claimDefinition = _.find(claimDefinitions, { identifier });
    const typeSufix = claimDefinition ? Claim.getPath(claimDefinition.type) : null;
    if (typeSufix) {
      claimPath = _.find(claimsPathRef, (o) => _.endsWith(o, typeSufix));
    }
  }
  return claimPath || sufix;
}

/**
 * Transforms a list of UCAs into the signature property of the verifiable claims
 */
class CvcMerkleProof {
  static get PADDING_INCREMENTS() {
    return 16;
  }

  constructor(ucas, claimsPathRef) {
    const withRandomUcas = CvcMerkleProof.padTree(ucas);
    this.type = 'CvcMerkleProof2018';
    this.merkleRoot = null;
    this.anchor = 'TBD (Civic Blockchain Attestation)';
    this.leaves = CvcMerkleProof.getAllAttestableValue(withRandomUcas);
    this.buildMerkleTree(claimsPathRef);
  }

  buildMerkleTree(claimsPathRef) {
    const merkleTools = new MerkleTools();
    const hashes = _.map(this.leaves, (n) => sha256(n.value));
    merkleTools.addLeaves(hashes);
    merkleTools.makeTree();
    _.forEach(hashes, (hash, idx) => {
      this.leaves[idx].claimPath = getClaimPath(this.leaves[idx].identifier, claimsPathRef);
      this.leaves[idx].targetHash = hash;
      this.leaves[idx].node = merkleTools.getProof(idx);
    });
    this.leaves = _.filter(this.leaves, (el) => !(el.identifier === 'cvc:Random:node'));
    this.merkleRoot = merkleTools.getMerkleRoot().toString('hex');
  }

  static padTree(nodes) {
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

module.exports = { CvcMerkleProof };
