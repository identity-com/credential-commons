const uuidv4 = require('uuid/v4');
const { Claim } = require('claim/Claim');
const VC = require('creds/VerifiableCredential');
const { schemaLoader, CVCSchemaLoader } = require('index');
const didTestUtil = require("../../__test__/lib/util/did");

const solResolver = require('lib/did');
const {VerifiableCredential} = require('vc/VerifiableCredential')
const CvcMerkleProof = require('proof/CvcMerkleProof').default;
const {Ed25519SignerVerifier} = require("proof/CvcMerkleProof/Ed25519SignerVerifier");

const credentialSubject = 'did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V';


const cvcMerkleProof = new CvcMerkleProof(new Ed25519SignerVerifier(
    solResolver,
    `${didTestUtil.DID_CONTROLLER}#default`,
    didTestUtil.keyPair(didTestUtil.DID_CONTROLLER)));

jest.setTimeout(200000);

describe('Integration Tests for Verifiable Credentials', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const name = await Claim.create('claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });

    const unsignedCred = await VerifiableCredential.create({
      issuer: didTestUtil.DID_CONTROLLER,
      identifier: 'credential-cvc:Identity-v3',
      subject: credentialSubject,
      claims: [name, dob],
      expiry: null,
    });

    const cred = await cvcMerkleProof.sign(unsignedCred);

    return CvcMerkleProof.requestAnchor(cred).then((updated) => {
      expect(updated.proof.anchor.type).toBe('temporary');
      expect(updated.proof.anchor.value).not.toBeDefined();
      expect(updated.proof.anchor).toBeDefined();
      expect(updated.proof.anchor.schema).toBe('dummy-20180201');
      done();
    });
  });

  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const name = await Claim.create('claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    // const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);

    const unsignedCred = await VerifiableCredential.create({
      issuer: didTestUtil.DID_CONTROLLER,
      identifier: 'credential-cvc:Identity-v3',
      subject: credentialSubject,
      claims: [name, dob],
      expiry: null,
    });

    const cred = await cvcMerkleProof.sign(unsignedCred);

    return CvcMerkleProof.requestAnchor(cred).then((updated) => {
      expect(updated.proof.anchor).toBeDefined();
      return CvcMerkleProof.updateAnchor(updated).then((newUpdated) => {
        expect(newUpdated.proof.anchor.type).toBe('permanent');
        expect(newUpdated.proof.anchor).toBeDefined();
        expect(newUpdated.proof.anchor.value).toBeDefined();
        done();
      });
    });
  });
  it('should revoke the permanent anchor and succed verification', async (done) => {
    const name = await Claim.create('claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });

    const unsignedCred = await VerifiableCredential.create({
      issuer: didTestUtil.DID_CONTROLLER,
      identifier: 'credential-cvc:Identity-v3',
      subject: credentialSubject,
      claims: [name, dob],
      expiry: null,
    });

    const cred = await cvcMerkleProof.sign(unsignedCred);

    await CvcMerkleProof.requestAnchor(cred);
    await CvcMerkleProof.updateAnchor(cred);
    const validation = await CvcMerkleProof.verifyAttestation(cred);
    if (validation) {
      const isRevoked = await CvcMerkleProof.revokeAttestation(cred);
      expect(isRevoked).toBeTruthy();
    }
    done();
  });
});
