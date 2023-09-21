const { v4: uuidv4 } = require('uuid');
const { Claim } = require('../../src/claim/Claim');
const VC = require('../../src/creds/VerifiableCredential');
const { schemaLoader, CVCSchemaLoader } = require('../../src');

const credentialSubject = 'did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V';

jest.setTimeout(200000);

describe('Integration Tests for Verifiable Credentials', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  it('should request an anchor for Credential and return an temporary attestation', async () => {
    const name = await Claim.create(
      'claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' },
    );

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    const updated = await cred.requestAnchor();
    expect(updated.proof.anchor.type).toBe('temporary');
    expect(updated.proof.anchor.value).not.toBeDefined();
    expect(updated.proof.anchor).toBeDefined();
    expect(updated.proof.anchor.schema).toBe('dummy-20180201');
  });

  it('should refresh an temporary anchoring with an permanent one', async () => {
    const name = await Claim.create(
      'claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' },
    );

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    const updated = await cred.requestAnchor();
    expect(updated.proof.anchor).toBeDefined();
    const newUpdated = await updated.updateAnchor();
    expect(newUpdated.proof.anchor.type).toBe('permanent');
    expect(newUpdated.proof.anchor).toBeDefined();
    expect(newUpdated.proof.anchor.value).toBeDefined();
  });

  it('should revoke the permanent anchor and succeed verification', async () => {
    const name = await Claim.create(
      'claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' },
    );

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
    const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);
    await cred.requestAnchor();
    await cred.updateAnchor();
    const validation = await cred.verifyAttestation();
    expect(validation).toBeTruthy();
    const isRevoked = await cred.revokeAttestation();
    expect(isRevoked).toBeTruthy();
  });
});
