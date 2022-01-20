const nacl = require('tweetnacl');
const { TextEncoder } = require('util');
const signerVerifier = require('../../src/lib/signerVerifier');
const {
  mockDids,
  DID_SPARSE,
  privateKeyBase58,
  keyPair,
} = require('./util/did');

const textEncoder = new TextEncoder();

const DUMMY_MERKLE_ROOT = 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4';

// TODO: Replace verify with new implementation once ready (IDCOM-1428)
const verify = (data, signature, publicKey) => nacl.sign.detached.verify(
  textEncoder.encode(data),
  Uint8Array.from(Buffer.from(signature, 'hex')),
  publicKey,
);

describe('signerVerifier', () => {
  beforeAll(mockDids);

  it('creates a signer from a private key', async () => {
    const keypair = keyPair(DID_SPARSE);

    const signer = await signerVerifier.signer({
      verificationMethod: `${DID_SPARSE}#default`,
      privateKey: privateKeyBase58(DID_SPARSE),
    });

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verified = verify(DUMMY_MERKLE_ROOT, signed.signature, keypair.publicKey);

    expect(verified).toBe(true);
  });

  it('creates a signer from a keypair', async () => {
    const keypair = keyPair(DID_SPARSE);

    const signer = await signerVerifier.signer({
      verificationMethod: `${DID_SPARSE}#default`,
      keypair,
    });

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verified = verify(DUMMY_MERKLE_ROOT, signed.signature, keypair.publicKey);

    expect(verified).toBe(true);
  });

  it('uses a provided signer', async () => {
    const verificationMethod = `${DID_SPARSE}#default`;
    const keypair = keyPair(DID_SPARSE);

    const customSigner = {
      sign(proof) {
        const encodedData = textEncoder.encode(proof.merkleRoot);

        const signature = nacl.sign.detached(encodedData, keypair.secretKey);

        return {
          signature,
          verificationMethod,
        };
      },
    };

    const signer = await signerVerifier.signer({
      verificationMethod,
      signer: customSigner,
    });

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verified = verify(DUMMY_MERKLE_ROOT, signed.signature, keypair.publicKey);

    expect(verified).toBe(true);
  });
});
