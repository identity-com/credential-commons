const { Claim } = require('./claim/Claim');
const VC = require('./creds/VerifiableCredential');
const { initServices, services } = require('./services/index');
const isValidGlobalIdentifier = require('./isValidGlobalIdentifier');
const isClaimRelated = require('./isClaimRelated');
/**
 * Entry Point for Civic Credential Commons
 * @returns {CredentialCommons}
 * @constructor
 */
function CredentialCommons() {
  this.Claim = Claim;
  this.VC = VC;
  this.init = initServices;
  this.isValidGlobalIdentifier = isValidGlobalIdentifier;
  this.isClaimRelated = isClaimRelated;
  this.services = services;
  return this;
}

// to work with entry points in multi module manage the best way
module.exports = new CredentialCommons();