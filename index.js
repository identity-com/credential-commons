const UCA = require('./src/uca/UserCollectableAttribute');
const VC = require('./src/creds/VerifiableCredential');
const { initServices } = require('./src/services/index');

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
