'use strict';

const UCA = require('./uca/UserCollectableAttribute');
const VC = require('./creds/VerifiableCredential');
const { initServices } = require('./services/index');

function CredentialCommons(config, http) {
  if (config) {
    initServices(config);
  }
  if (http) {
    initServices(http);
  }
  this.UCA = UCA;
  this.UCA = VC;

  return this;
}

module.exports = CredentialCommons;