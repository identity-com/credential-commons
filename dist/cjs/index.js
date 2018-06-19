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
  this.VC = VC;

  return this;
}

module.exports = new CredentialCommons();