const { Claim } = require('./claim/Claim');
const VC = require('./creds/VerifiableCredential');
const { initServices, services } = require('./services/index');
const isValidGlobalIdentifier = require('./isValidGlobalIdentifier');
const isClaimRelated = require('./isClaimRelated');
const errors = require('./errors');
const constants = require('./constants');
const claimDefinitions = require('./claim/definitions');
const credentialDefinitions = require('./creds/definitions');

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
  this.errors = errors;
  this.constants = constants;
  this.claimDefinitions = claimDefinitions;
  this.credentialDefinitions = credentialDefinitions;
  return this;
}

// to work with entry points in multi module manage the best way
module.exports = new CredentialCommons();
