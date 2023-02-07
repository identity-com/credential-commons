// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {ECSignature, HDNode} from 'bitcoinjs-lib';

interface KeyStorage {
    [key_name: string]: string
}

/**
 * MiniCryptoManagerImpl - A minimal CryptoManagerImpl for the portable CryptoManagerInterface
 * to provide only default sign() and verify() functions to credential-commons with minimal dependencies.
 *
 * Particularities of this Mini Implementation:
 *
 *  1. Only sign() and verify() function are available;
 *
 *  2. This implementation is based on HDNode key material from bitcoinjs library;
 *
 *  3. There is a volatile in memory only Storage Implementation to allow `installKey()`.
 *     You should `installKey` a PVT key or a PUB key (verify only) before call `sign()` or `verify()`.
 *     The installed key is removed after `sign()` or `verify()` function was called.
 */
class MiniCryptoManagerImpl {
    private readonly KEY_STORAGE: KeyStorage;

    constructor() {
        this.KEY_STORAGE = {};
    }

    /**
     * Install a pvt or a pub key on a keyName to be used on `sign()` or `verify()` function later.
     * @param  {} keyName - name of the key to be installed.
     * @param  {} key - a pvt or a pub key in base58 format.
     */
    installKey(keyName: string, key: string) {
        try {
            // Test if key is a valid HDNode key
            HDNode.fromBase58(key);
            this.KEY_STORAGE[keyName] = key;
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            throw new Error(`Invalid key format: ${err.message}`);
        }
    }

    /**
     * Return input data signed using the specified key.
     *
     * Signature return value will be to be a DER encoded value.
     *
     * @param { string } keyName - name of the key to be used to sign.
     * @param { string } hexHash - hex string representation of the hash
     */
    sign(keyName: string, hexHash: string) {
        const privateKey = this.KEY_STORAGE[keyName];
        const keyPair = HDNode.fromBase58(privateKey);

        const hash = Buffer.from(hexHash, 'hex');
        const signature = keyPair.sign(hash);
        const hexSignature = signature.toDER().toString('hex');

        // keys are volatile in this impl, removes
        delete this.KEY_STORAGE[keyName];

        return hexSignature;
    }

    /**
     * Return true if signature has been verified, false otherwise.
     *
     * @param { string } keyName - name of the key to be used to verify signature.
     * @param { string } hexHash - hex string representation of the hash
     * @param { string } hexSignature - DER encoded signature.
     */
    verify(keyName: string, hexHash: string, hexSignature: string) {
        const key = this.KEY_STORAGE[keyName];
        const keyPair = HDNode.fromBase58(key);

        const hash = Buffer.from(hexHash, 'hex');
        const signature = Buffer.from(hexSignature, 'hex');
        const ecSignature = ECSignature.fromDER(signature);

        // keys are volatile in this impl, removes
        delete this.KEY_STORAGE[keyName];

        return keyPair.verify(hash, ecSignature);
    }
}

export = MiniCryptoManagerImpl
