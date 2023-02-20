const nacl = require('tweetnacl');
const signerVerifier = require('lib/signerVerifier');
const {
  mockDids,
  DID_SPARSE,
  privateKeyBase58,
  keyPair,
} = require('./util/did');
const resolver = require("lib/did");

const DUMMY_MERKLE_ROOT = 'aa4149dda8fd2fac435898372f1de399140f6c50dbc3d40585c913701ce902c4';

describe('signerVerifier', () => {
  beforeAll(mockDids);

  it('creates a signer from a private key', async () => {
    const privateKey = privateKeyBase58(DID_SPARSE);
    const verificationMethod = `${DID_SPARSE}#default`;

    const signer = await signerVerifier.signer({
      verificationMethod,
      privateKey,
    }, resolver);

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verifier = await signerVerifier.verifier(DID_SPARSE, verificationMethod, resolver);
    const verified = verifier.verify({
      issuer: DID_SPARSE,
      proof: {
        merkleRoot: DUMMY_MERKLE_ROOT,
        merkleRootSignature: signed,
      },
    });

    expect(verified).toBe(true);
  });

  it('creates a signer from a keypair', async () => {
    const keypair = keyPair(DID_SPARSE);
    const verificationMethod = `${DID_SPARSE}#default`;

    const signer = await signerVerifier.signer({
      verificationMethod,
      keypair,
    }, resolver);

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verifier = await signerVerifier.verifier(DID_SPARSE, verificationMethod, resolver);
    const verified = verifier.verify({
      issuer: DID_SPARSE,
      proof: {
        merkleRoot: DUMMY_MERKLE_ROOT,
        merkleRootSignature: signed,
      },
    });

    expect(verified).toBe(true);
  });

  it('uses a provided signer', async () => {
    const verificationMethod = `${DID_SPARSE}#default`;
    const keypair = keyPair(DID_SPARSE);

    const customSigner = {
      sign(proof) {
        const encodedData = Buffer.from(proof.merkleRoot, 'hex');

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
    }, resolver);

    const signed = signer.sign({ merkleRoot: DUMMY_MERKLE_ROOT });

    expect(signed).toBeTruthy();

    const verifier = await signerVerifier.verifier(DID_SPARSE, verificationMethod, resolver);
    const verified = verifier.verify({
      issuer: DID_SPARSE,
      proof: {
        merkleRoot: DUMMY_MERKLE_ROOT,
        merkleRootSignature: signed,
      },
    });

    expect(verified).toBe(true);
  });
});
