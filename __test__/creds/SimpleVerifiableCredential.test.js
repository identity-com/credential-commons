/* eslint-disable max-len */
const _ = require("lodash");
const { v4: uuidv4 } = require("uuid");
const sjcl = require("sjcl");
const VC = require("../../src/creds/VerifiableCredential");
const MiniCryptoManagerImpl = require("../../src/services/MiniCryptoManagerImpl");
const didTestUtil = require("../lib/util/did");

const { schemaLoader } = require("../../src");
const {
  SimpleSchemaLoader,
} = require("../../src/schemas/jsonSchema/loaders/simple");
const simpleSchema = require("../schema/fixtures/credential-test:Social-v1.json");

const { stubResolver } = require("../lib/util/did");

const credentialSubject =
  "did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V";

jest.setTimeout(150000);

const XPVT1 = 'xprvA1yULd2DFYnQRVbLiAKrFdftVLsANiC3rqLvp8iiCbnchcWqd6kJPoaV3sy7R6CjHM8RbpoNdWVgiPZLVa1EmneRLtwiitNpWgwyVmjvay7'; // eslint-disable-line
const XPUB1 = 'xpub6Expk8Z75vLhdyfopBrrcmcd3NhenAuuE4GXcX8KkwKbaQqzAe4Ywbtxu9F95hRHj79PvdtYEJcoR6gesbZ79fS4bLi1PQtm81rjxAHeLL9'; // eslint-disable-line

const miniCryptoManager = new MiniCryptoManagerImpl();

const signAttestationSubject = (subject, xprv, xpub) => {
  const { label } = subject;
  const { data } = subject;
  const tupleToHash = JSON.stringify({ xpub, label, data });
  const hashToSignHex = sjcl.codec.hex.fromBits(
    sjcl.hash.sha256.hash(tupleToHash),
  );
  const keyName = `TEMP_KEY_${new Date().getTime()}`;
  miniCryptoManager.installKey(keyName, xprv);
  const signature = miniCryptoManager.sign(keyName, hashToSignHex);

  return {
    pub: xpub,
    label,
    data,
    signature,
  };
};

const toValueObject = (obj) => JSON.parse(JSON.stringify(obj));

const rawClaimsArray = (rawClaims) => _.map(rawClaims, (value, key) => ({ key, value }));

const twitterHandle = "@abc";

const rawClaims = {
  type: "twitter",
  identifier: twitterHandle,
};

const issuer = didTestUtil.DID_CONTROLLER;
const verificationMethod = `${didTestUtil.DID_CONTROLLER}#default`;
const keypair = didTestUtil.keyPair(didTestUtil.DID_CONTROLLER);

describe("Unit tests for Verifiable Credentials", () => {
  beforeAll(() => {
    const { title } = simpleSchema;
    schemaLoader.addLoader(
      new SimpleSchemaLoader({
        [title]: simpleSchema,
      }),
    );

    VC.setResolver(stubResolver);
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  it("should create a simple credential", async () => {
    const cred = await VC.create(
      "credential-test:Social-v1",
      uuidv4(),
      null,
      credentialSubject,
      rawClaimsArray(rawClaims),
    );

    expect(cred.credentialSubject.type).toBe('twitter');
    expect(cred.credentialSubject.identifier).toBe(twitterHandle);
    expect(cred.proof.leaves).toHaveLength(2);
  });

  it("should create and verify a simple credential", async () => {
    const cred = await VC.create(
      "credential-test:Social-v1",
      issuer,
      null,
      credentialSubject,
      rawClaimsArray(rawClaims),
      null,
      {
        verificationMethod,
        keypair,
      }
    );
    const credJSON = toValueObject(cred);

    const credObj = await VC.fromJSON(credJSON, true);
    let isValidProof = await credObj.verifyProofs();
    let isSignatureValid = await credObj.verifyMerkletreeSignature();

    expect(isValidProof).toBeTruthy();
    expect(isSignatureValid).toBeTruthy();
  });

  it("should fail proof validation if the simple credential is tempered", async () => {
    const cred = await VC.create(
      "credential-test:Social-v1",
      issuer,
      null,
      credentialSubject,
      rawClaimsArray(rawClaims),
      null,
      {
        verificationMethod,
        keypair,
      }
    );
    const credJSON = toValueObject(cred);

    // temper the credential
    credJSON.credentialSubject.identifier = "fake-identifier";

    const credObj = await VC.fromJSON(credJSON, true);
    let isValidProof = await credObj.verifyProofs();
    let isSignatureValid = await credObj.verifyMerkletreeSignature();

    expect(isValidProof).toBeFalsy();
    expect(isSignatureValid).toBeTruthy();
  });

  it("should fail proof validation if the simple credential signature is invalid", async () => {
    const cred = await VC.create(
      "credential-test:Social-v1",
      issuer,
      null,
      credentialSubject,
      rawClaimsArray(rawClaims),
      null,
      {
        verificationMethod,
        keypair,
      }
    );
    const credJSON = toValueObject(cred);

    // update with an invalid signature
    credJSON.proof.merkleRootSignature.signature =
     "6b986e01211bf2ebd0dbc6c2b401403121d227046371e30765b585f64d0941294ff9713bc58fde54316bf56602ca2166ce83b27a2ecb372d52b763ed6021660d";

    const credObj = await VC.fromJSON(credJSON, true);
    let isValidProof = await credObj.verifyProofs();
    let isSignatureValid = await credObj.verifyMerkletreeSignature();

    expect(isValidProof).toBeTruthy();
    expect(isSignatureValid).toBeFalsy();
  });
});
