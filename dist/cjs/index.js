"use strict";

const {
  Claim
} = require('./claim/Claim');

const {
  UserCollectableAttribute
} = require('./uca/UCA');

const VC = require('./creds/VerifiableCredential');

const {
  initServices,
  services
} = require('./services/index');

const isValidGlobalIdentifier = require('./isValidGlobalIdentifier');

const isClaimRelated = require('./isClaimRelated');

const errors = require('./errors');

const constants = require('./constants');

const claimDefinitions = require('./claim/definitions');

const credentialDefinitions = require('./creds/definitions');

const aggregate = require('./AggregationHandler');

const {
  schemaLoader
} = require('./schemas/jsonSchema');

const CVCSchemaLoader = require('./schemas/jsonSchema/loaders/cvc');

const VCCompat = require('./creds/VerifiableCredentialProxy');
/**
 * Entry Point for Civic Credential Commons
 * @returns {CredentialCommons}
 * @constructor
 */


function CredentialCommons() {
  this.Claim = Claim;
  this.init = initServices;
  this.isValidGlobalIdentifier = isValidGlobalIdentifier;
  this.isClaimRelated = isClaimRelated;
  this.services = services;
  this.aggregate = aggregate;
  this.errors = errors;
  this.constants = constants;
  this.claimDefinitions = claimDefinitions;
  this.credentialDefinitions = credentialDefinitions;
  this.schemaLoader = schemaLoader;
  this.CVCSchemaLoader = CVCSchemaLoader;
  this.UserCollectableAttribute = UserCollectableAttribute;
  this.VC = VC;
  this.VCCompat = VCCompat;
  return this;
} // to work with entry points in multi module manage the best way


module.exports = new CredentialCommons();