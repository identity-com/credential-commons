const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { TextEncoder } = require('util');
const didUtil = require('./did');

const textEncoder = new TextEncoder();

class Ed25519Signer {
  constructor(key, verificationMethod) {
    this.key = key;
    this.verificationMethod = verificationMethod;
  }

  sign(data) {
    const signed = nacl.sign.detached(textEncoder.encode(data.merkleRoot), bs58.decode(this.key));
    const signature = Buffer.from(signed).toString('hex');

    return {
      signature,
      verificationMethod: this.verificationMethod,
    };
  }
}

class Ed25519Verifier {
  constructor(key) {
    this.key = key;
  }

  verify(vc) {
    return nacl.sign.detached.verify(
      textEncoder.encode(vc.proof.merkleRoot),
      Uint8Array.from(Buffer.from(vc.proof.merkleRootSignature.signature, 'hex')),
      bs58.decode(this.key),
    );
  }
}

/**
 * Creates a signer from the provided information
 *
 * @param options Signer options:
 * @param options.verificationMethod The verificationMethod for the signing key
 * @param options.keypair The keypair to sign with
 *    or
 * @param options.privateKey The private key to sign with
 *    or
 * @param options.signer An object implementing a `sign(CvcMerkleProof)` method
 */
const signer = async (options) => {
  if (!options.signer && !options.keypair && !options.privateKey) {
    throw new Error('Either a signer, keypair or privateKey is required');
  }

  const { verificationMethod } = options;
  let { signer: providedSigner } = options;

  // Create a signer from keypair/key
  if (!providedSigner) {
    const [did] = verificationMethod.split('#');

    const document = await didUtil.resolve(did);

    let { privateKey } = options;
    if (!privateKey) {
      privateKey = bs58.encode(options.keypair.secretKey);
    }

    const foundMethod = didUtil.findVerificationMethod(document, verificationMethod);
    if (!foundMethod) {
      throw new Error('The provided verificationMethod is not valid on the DID document');
    }

    // Check the type is supported and assign the appropriate signer
    switch (foundMethod.type) {
      case 'Ed25519VerificationKey2018':
      case 'Ed25519VerificationKey2020':
        providedSigner = new Ed25519Signer(privateKey, verificationMethod);
        break;
      default:
        throw new Error(`Unsupported type ${foundMethod.type}`);
    }
  }

  return {
    verificationMethod,
    signer: providedSigner,
  };
};

const verifier = async (did, verificationMethod) => {
  const canSignFor = await didUtil.canSign(did, verificationMethod);
  if (!canSignFor) {
    // always return false if the vm cannot sign for the
    return {
      verify() {
        return false;
      },
    };
  }

  const [vmDid] = verificationMethod.split('#');
  const document = await didUtil.resolve(vmDid);
  const foundMethod = didUtil.findVerificationMethod(document, verificationMethod);

  // Check the type is supported and assign the appropriate verifier
  switch (foundMethod.type) {
    case 'Ed25519VerificationKey2018':
    case 'Ed25519VerificationKey2020':
      return new Ed25519Verifier(foundMethod.publicKeyBase58);
    default:
      throw new Error(`Unsupported type ${foundMethod.type}`);
  }
};

module.exports = {
  signer,
  verifier,
};
