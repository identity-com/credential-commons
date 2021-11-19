'use strict';

const sjcl = require('sjcl');
const logger = require('./logger');

class SecureRandom {
  constructor(seedHexString) {
    logger.debug('Init Secure Random');
    // eslint-disable-next-line new-cap
    this.sjclRandom = new sjcl.prng(10);

    if (seedHexString) {
      const seed = sjcl.codec.hex.toBits(seedHexString);
      this.sjclRandom.addEntropy(seed, undefined, 'csprng');
      this.isSeeded = true;
    } else {
      try {
        logger.debug('Trying crypto');
        /* eslint-disable global-require */
        const hexString = require('crypto').randomBytes(1024).toString('hex');
        /* eslint-enable global-require */
        const seed = sjcl.codec.hex.toBits(hexString);
        this.sjclRandom.addEntropy(seed, undefined, 'csprng');
        this.isSeeded = true;
      } catch (error) {
        logger.warn(`Crypto: ${error}`);
        this.isSeeded = false;
      }
    }
  }

  wordWith(size) {
    if (!this.isSeeded) {
      throw new Error("Can't user SecureRandom before seeding");
    }

    const randomBytes = this.sjclRandom.randomWords(size / 8, 10);
    return sjcl.codec.hex.fromBits(randomBytes);
  }
}

module.exports = SecureRandom;