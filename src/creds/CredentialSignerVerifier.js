const _ = require('lodash');
const { HDNode, ECSignature } = require('bitcoinjs-lib');

const SIGNATURE_ALGO = 'ec256k1';
class CredentialSignerVerifier {
  /**
   * Creates a new instance of a CredentialSignerVerifier
   *
   * @param options.keyPair any instace that implements sign and verify interface
   * or
   * @param options.prvBase58 bse58 serialized private key
   * or for verification only
   * @param options.pubBase58 bse58 serialized public key
   */
  constructor(options) {
    if (_.isEmpty(options.keyPair) && _.isEmpty(options.prvBase58) && _.isEmpty(options.pubBase58)) {
      throw new Error('Either a keyPair, prvBase58 or pubBase58(to verify only) is required');
    }
    this.keyPair = options.keyPair || HDNode.fromBase58(options.prvBase58 || options.pubBase58);
  }

  /**
   * Verify is a credential has a valid merkletree signature, using a pinned pubkey
   * @param credential
   * @returns {*|boolean}
   */
  isSignatureValid(credential) {
    if (_.isEmpty(credential.proof)
        || _.isEmpty(credential.proof.merkleRoot)
        || _.isEmpty(credential.proof.merkleRootSignature)) {
      throw Error('Invalid Credential Proof Schema');
    }

    try {
      const signatureHex = _.get(credential, 'proof.merkleRootSignature.signature');
      const signature = signatureHex ? ECSignature.fromDER(Buffer.from(signatureHex, 'hex')) : null;
      const merkleRoot = _.get(credential, 'proof.merkleRoot');
      return (signature && merkleRoot) ? this.keyPair.verify(Buffer.from(merkleRoot, 'hex'), signature) : false;
    } catch (error) {
      // verify throws in must cases but we want to return false
      return false;
    }
  }

  /**
   * Create a merkleRootSignature object by signing with a pinned private key
   * @param proof
   * @returns {{signature, pubBase58: *, algo: string}}
   */
  sign(proof) {
    const hash = Buffer.from(proof.merkleRoot, 'hex');
    const signature = this.keyPair.sign(hash);
    return {
      algo: SIGNATURE_ALGO,
      pubBase58: this.keyPair.neutered().toBase58(),
      signature: signature.toDER().toString('hex'),
    };
  }
}

module.exports = CredentialSignerVerifier;
