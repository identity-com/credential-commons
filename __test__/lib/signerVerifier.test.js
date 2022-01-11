const nacl = require('tweetnacl');
const signerVerifier = require('../../src/lib/signerVerifier');
const didUtil = require('../../src/lib/did');
const {
  mockDids,
  DID_SPARSE,
  privateKeyBase58,
  keyPair,
} = require('./util/did');

const originalResolve = didUtil.resolve;
didUtil.resolve = jest.fn()
  .mockImplementation(did => originalResolve(did))
  .bind(didUtil);

const textEncoder = new TextEncoder();

const SIGN_DATA = 'dummy_data_to_sign';

// TODO: Replace verify with new implementation once ready
const verify = (data, signature, publicKey) => nacl.sign.detached.verify(
  textEncoder.encode(data),
  Uint8Array.from(Buffer.from(signature, 'hex')),
  publicKey,
);

describe('signerVerifier', () => {
  beforeAll(mockDids);

  it('creates a signer from a private key', async () => {
    const keypair = keyPair(DID_SPARSE);

    const { signer } = await signerVerifier.signer({
      verificationMethod: `${DID_SPARSE}#default`,
      privateKey: privateKeyBase58(DID_SPARSE),
    });

    const signed = signer.sign(SIGN_DATA);

    expect(signed).toBeTruthy();

    const verified = verify(SIGN_DATA, signed.signature, keypair.publicKey);

    expect(verified).toBe(true);
  });

  it('creates a signer from a keypair', async () => {
    const keypair = keyPair(DID_SPARSE);

    const { signer } = await signerVerifier.signer({
      verificationMethod: `${DID_SPARSE}#default`,
      keypair,
    });

    const signed = signer.sign(SIGN_DATA);

    expect(signed).toBeTruthy();

    const verified = verify(SIGN_DATA, signed.signature, keypair.publicKey);

    expect(verified).toBe(true);
  });

  it('uses a provided signer', async () => {
    const verificationMethod = `${DID_SPARSE}#default`;
    const keypair = keyPair(DID_SPARSE);

    const customSigner = {
      sign(data) {
        const encodedData = textEncoder.encode(data);

        const signature = nacl.sign.detached(encodedData, keypair.secretKey);

        return {
          signature,
          verificationMethod,
        };
      },
    };

    const { signer } = await signerVerifier.signer({
      verificationMethod,
      signer: customSigner,
    });

    const signed = signer.sign(SIGN_DATA);

    expect(signed)
      .toBeTruthy();

    const verified = verify(SIGN_DATA, signed.signature, keypair.publicKey);

    expect(verified)
      .toBe(true);
  });
});
