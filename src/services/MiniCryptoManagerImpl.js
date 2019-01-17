const { HDNode, ECSignature } = require('bitcoinjs-lib');

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
 *  3. There is no Storage Implementation nor any key storage as well. All "keyName" parameters are treated as
 *    the own key in a base58 format ready to be used for sign or verify;
 */
class MiniCryptoManagerImpl {
  /**
   * Return input data signed using the specified key.
   *
   * Signature return value will be to be a DER encoded value.
   *
   * @param { string } keyName - The pvtKey in base58 format to be used to sign.
   *                             NOTE: This is not just a keyName!
   * @param { string } hexHash - hex string representation of the hash
   */
  sign(keyName, hexHash) { // eslint-disable-line
    const privateKey = keyName;
    const keyPair = HDNode.fromBase58(privateKey);

    const hash = Buffer.from(hexHash, 'hex');
    const signature = keyPair.sign(hash);
    const hexSignature = signature.toDER().toString('hex');
    return hexSignature;
  }

  /**
   * Return true if signature has been verified, false otherwise.
   *
   * @param { string } keyName - The pubKey in base58 format to be used to verify signature.
   *                             NOTE: This is not just a keyName!
   * @param { string } hexHash - hex string representation of the hash
   * @param { string } hexSignature - DER encoded signature.
   */
  verify(keyName, hexHash, hexSignature) { // eslint-disable-line
    const key = keyName;
    const keyPair = HDNode.fromBase58(key);

    const hash = Buffer.from(hexHash, 'hex');
    const signature = Buffer.from(hexSignature, 'hex');
    const ecSignature = ECSignature.fromDER(signature);
    return keyPair.verify(hash, ecSignature);
  }
}

module.exports = MiniCryptoManagerImpl;
