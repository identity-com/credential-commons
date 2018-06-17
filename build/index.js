'use strict';

var UCA = require('./uca/UserCollectableAttribute');
var VC = require('./creds/VerifiableCredential');

var _require = require('./services/index'),
    initServices = _require.initServices;

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