import sjcl from 'sjcl';
import logger from './config';

class SecureRandomizer {
  constructor() {
    logger.debug('Init Secure Randon');
    this.sjclRandom = new sjcl.prng(10);

    try {
      logger.debug('Trying crypto');
      const hexString = require('crypto').randomBytes(1024).toString('hex');
      const seed = sjcl.codec.hex.toBits(hexString);
      this.sjclRandom.addEntropy(seed, undefined, 'csprng');
      this.isSeeded = true;
    } catch (error) {
      logger.warn(`Crypto: ${error}`);
      this.isSeeded = false;
    }
  }

  wordWith(size) {
    if (!this.isSeeded) {
      throw new Error("Can't user SecureRandon before seeding");
    }

    const randomBytes = this.sjclRandom.randomWords(size / 8, 10);
    return sjcl.codec.hex.fromBits(randomBytes);
  }
}

export default new SecureRandomizer();
