'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sjcl = require('sjcl');
var logger = require('./logger');

var SecureRandomizer = function () {
  function SecureRandomizer() {
    (0, _classCallCheck3.default)(this, SecureRandomizer);

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

  (0, _createClass3.default)(SecureRandomizer, [{
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