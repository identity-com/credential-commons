import {codec, prng, SjclRandom} from 'sjcl';
import logger from './logger';

/* eslint-disable global-require */
import {randomBytes} from 'crypto';

export = class SecureRandom {
    private readonly isSeeded: boolean;
    private sjclRandom: SjclRandom;

    constructor(seedHexString: string) {
        logger.debug('Init Secure Random');
        // eslint-disable-next-line new-cap
        this.sjclRandom = new prng(10);

        if (seedHexString) {
            const seed = codec.hex.toBits(seedHexString);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // TODO: Provide a correct estimatedEntropy argument (there is a type mismatch)
            this.sjclRandom.addEntropy(seed, undefined, 'csprng');
            this.isSeeded = true;
        } else {
            try {
                logger.debug('Trying crypto');
                const hexString = randomBytes(1024).toString('hex');
                /* eslint-enable global-require */
                const seed = codec.hex.toBits(hexString);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // TODO: Provide a correct estimatedEntropy argument (there is a type mismatch)
                this.sjclRandom.addEntropy(seed, undefined, 'csprng');
                this.isSeeded = true;
            } catch (error) {
                logger.warn(`Crypto: ${error}`);
                this.isSeeded = false;
            }
        }
    }

    wordWith(size: number) {
        if (!this.isSeeded) {
            throw new Error("Can't user SecureRandom before seeding");
        }

        const randomBytes = this.sjclRandom.randomWords(size / 8, 10);
        return codec.hex.fromBits(randomBytes);
    }
}