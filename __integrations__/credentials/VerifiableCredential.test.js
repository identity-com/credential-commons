const UCA = require('../../src/uca/UserCollectableAttribute');
const VC = require('../../src/creds/VerifiableCredential');

jest.mock('../../src/creds/definitions');

jest.setTimeout(200000);

// DO NOT FORGET TO CONFIGURE THE BITGO WALLET
describe('Integration Tests for Verifiable Credentials', () => {
  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const timestamp = new Date().getTime();
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', `jest:test${timestamp}`, null, [name, dob], 1);
    return cred.requestAnchor().then((updated) => {
      expect(updated.signature.anchor.type).toBe('temporary');
      expect(updated.signature.anchor.value).not.toBeDefined();
      expect(updated.signature.anchor).toBeDefined();
      expect(updated.signature.anchor.schema).toBe('tbch-20180201');
      done();
    });
  });
  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const timestamp = new Date().getTime();
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', `jest:test${timestamp}`, null, [name, dob], 1);
    return cred.requestAnchor().then((updated) => {
      expect(updated.signature.anchor).toBeDefined();
      return updated.updateAnchor().then((newUpdated) => {
        expect(newUpdated.signature.anchor.type).toBe('permanent');
        expect(newUpdated.signature.anchor).toBeDefined();
        expect(newUpdated.signature.anchor.value).toBeDefined();
        done();
      });
    });
  });
  it('should revoke the permanent anchor and succed verification', async (done) => {
    const timestamp = new Date().getTime();
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', `jest:test${timestamp}`, null, [name, dob], 1);
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
