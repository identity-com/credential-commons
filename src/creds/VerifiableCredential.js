const _ = require('lodash');
const { VerifiableCredential: VerifiableCredentialNew } = require('../entities/VerifiableCredential');

class VerifiableCredential extends VerifiableCredentialNew {
  constructor(identifier, issuer, expiryIn, ucas, version, evidence) {
    const ucaObject = {};
    _.forEach(ucas, (uca, k) => {
      ucaObject[k] = uca;
    });

    super({
      metadata: {
        identifier,
        issuer,
      },
      claims: ucaObject,
      evidence,
    });
  }
}

module.exports = { VerifiableCredential };
