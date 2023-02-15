const uuidv4 = require('uuid/v4');
const { Claim } = require('claim/Claim');
const VC = require('creds/VerifiableCredential');
const { schemaLoader, CVCSchemaLoader } = require('index');

const credentialSubject = 'did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V';

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
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    return cred.requestAnchor().then((updated) => {
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
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    return cred.requestAnchor().then((updated) => {
      expect(updated.proof.anchor).toBeDefined();
      return updated.updateAnchor().then((newUpdated) => {
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
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    await cred.requestAnchor();
    await cred.updateAnchor();
    const validation = await cred.verifyAttestation();
    if (validation) {
      const isRevoked = await cred.revokeAttestation();
      expect(isRevoked).toBeTruthy();
    }
    done();
  });
});
