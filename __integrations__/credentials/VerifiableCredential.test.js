const { v4: uuidv4 } = require('uuid');
const { Claim } = require('../../src/claim/Claim');
const VC = require('../../src/creds/VerifiableCredential');

jest.setTimeout(200000);

describe('Integration Tests for Verifiable Credentials', () => {
  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('credential-cvc:Identity-v1', uuidv4(), null, [name, dob], 1);
    return cred.requestAnchor().then((updated) => {
      expect(updated.proof.anchor.type).toBe('temporary');
      expect(updated.proof.anchor.value).not.toBeDefined();
      expect(updated.proof.anchor).toBeDefined();
      expect(updated.proof.anchor.schema).toBe('dummy-20180201');
      done();
    });
  });
  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('credential-cvc:Identity-v1', uuidv4(), null, [name, dob], 1);
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
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('credential-cvc:Identity-v1', uuidv4(), null, [name, dob], 1);
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
