const sjcl = require("sjcl");

const sha256 = (stringToHash) =>
  sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(stringToHash));

module.exports = {
  sha256,
};
