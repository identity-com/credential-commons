'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sjcl = require('sjcl');
var logger = require('./logger');

var SecureRandomizer = function () {
  function SecureRandomizer() {
    _classCallCheck(this, SecureRandomizer);

    logger.debug('Init Secure Randon');
    // eslint-disable-next-line
    this.sjclRandom = new sjcl.prng(10);

    try {
      logger.debug('Trying crypto');
      /* eslint-disable global-require */
      var hexString = require('crypto').randomBytes(1024).toString('hex');
      /* eslint-enable global-require */
      var seed = sjcl.codec.hex.toBits(hexString);
      this.sjclRandom.addEntropy(seed, undefined, 'csprng');
      this.isSeeded = true;
    } catch (error) {
      logger.warn('Crypto: ' + error);
      this.isSeeded = false;
    }
  }

  _createClass(SecureRandomizer, [{
    key: 'wordWith',
    value: function wordWith(size) {
      if (!this.isSeeded) {
        throw new Error("Can't user SecureRandon before seeding");
      }

      var randomBytes = this.sjclRandom.randomWords(size / 8, 10);
      return sjcl.codec.hex.fromBits(randomBytes);
    }
  }]);

  return SecureRandomizer;
}();

module.exports = new SecureRandomizer();