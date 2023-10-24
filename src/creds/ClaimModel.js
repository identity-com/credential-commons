const _ = require("lodash");

/**
 * Transforms a list of UCAs into the claim property of the verifiable cliams
 */
class ClaimModel {
  constructor(ucas) {
    _.forEach(ucas, (uca) => {
      if (uca.key && uca.value) {
        // simple UCA
        this[uca.key] = uca.value;
      } else {
        const rootPropertyName = uca.getClaimRootPropertyName();
        if (!_.isEmpty(rootPropertyName)) {
          if (!this[rootPropertyName]) {
            this[rootPropertyName] = {};
          }

          this[rootPropertyName][uca.getClaimPropertyName()] =
            uca.getPlainValue();
        } else {
          this[uca.getClaimPropertyName()] = uca.getPlainValue();
        }
      }
    });
  }
}

module.exports = { ClaimModel };
