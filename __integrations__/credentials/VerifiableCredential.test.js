const { v4: uuidv4 } = require('uuid');
const { Claim } = require('../../src/entities/Claim');
const { VerifiableCredential: VC } = require('../../src/entities/VerifiableCredential');
const { VerifiableCredential: VCOld } = require('../../src/creds/VerifiableCredential');
const { initialize } = require('../../src');

jest.setTimeout(200000);
const addressValue = {
  country: 'X2sEB9F9W9', county: 'sDlIM4Rjpo', state: 'ZZEOrbenrM', street: 'JkHgN5gdZ2', unit: 'fo9OmPSZNe', city: 'LVkRGsKqIf', postalCode: '5JhmWkXBAg',
};
const dateValues = { day: 20, month: 3, year: 1978 };
const nameValues = { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' };

describe('Integration Tests for Verifiable Credentials', () => {
  beforeAll(initialize);

  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const name = new Claim('claim-cvc:Identity.name-v1', nameValues);
    const dob = new Claim('claim-cvc:Identity.dateOfBirth-v1', dateValues);
    const address = new Claim('claim-cvc:Identity.address-v1', addressValue);

    const cred = new VC({
      metadata: {
        identifier: 'credential-alt:Identity-v3',
        issuer: 'some issuer',
      },
      claims: {
        name,
        dob,
        address,
      },
    });

    return cred.requestAnchor().then((updated) => {
      expect(updated.proof.anchor.type).toBe('temporary');
      expect(updated.proof.anchor.value).not.toBeDefined();
      expect(updated.proof.anchor).toBeDefined();
      expect(updated.proof.anchor.schema).toBe('dummy-20180201');
      done();
    });
  });

  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const name = new Claim('claim-cvc:Identity.name-v1', { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    const cred = new VCOld('credential-alt:Identity-v1', uuidv4(), null, [name, dob], 1);
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
    const name = new Claim('claim-cvc:Identity.name-v1', { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    const cred = new VCOld('credential-alt:Identity-v1', uuidv4(), null, [name, dob], 1);
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
