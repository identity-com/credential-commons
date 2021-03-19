// eslint-disable-next-line max-classes-per-file
const _ = require('lodash');
const timestamp = require('unix-timestamp');
const { v4: uuidv4 } = require('uuid');
const { CvcMerkleProof } = require('../creds/CvcMerkleProof');
const { Claim } = require('./Claim');
const { AttestableEntity } = require('./AttestableEntity');

class VerifiableCredential extends AttestableEntity {
  constructor({
    metadata,
    claims,
  }) {
    // TODO: Why this?
    const claimValues = _.mapValues(claims, (claim) => claim.value);

    super(metadata.identifier, { ...metadata, claim: claimValues });

    const issuanceDateUCA = new Claim('claim-cvc:Meta.issuanceDate-v1', (new Date()).toISOString());
    // TODO: Hardcode expiry date to null
    const expiryUCA = new Claim('claim-cvc:Meta.expirationDate-v1', timestamp.toDate(timestamp.now('1y')).toISOString());
    const issuerUCA = new Claim('claim-cvc:Meta.issuer-v1', metadata.issuer);

    const proofUCAs = _.concat(Object.values(claims), issuerUCA, issuanceDateUCA, expiryUCA);

    this.metadata = metadata;
    this.claims = claims;
    this.proof = new CvcMerkleProof(proofUCAs);
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
