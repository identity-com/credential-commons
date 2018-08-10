const _ = require('lodash');
const fs = require('fs');

const UCA = require('../../src/uca/UserCollectableAttribute');
const VC = require('../../src/creds/VerifiableCredential');

jest.mock('../../src/creds/definitions');

jest.setTimeout(150000);

describe('Unit tests for Verifiable Credentials', () => {
  test('Dont construct undefined Credentials', () => {
    function createCredential() {
      const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
      const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
      return new VC('civ:cred:Test', 'jest:test', null, [name, dob], '1');
    }
    expect(createCredential).toThrowError('civ:cred:Test is not defined');
  });
  test('Dont construct Credentials with wrong version', () => {
    function createCredential() {
      const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
      const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
      return new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], '2');
    }
    expect(createCredential).toThrowError('Credential definition for civ:Credential:SimpleTest v2 not found');
  });
  test('New Defined Credentials', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBe('Barbosa');
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.dateOfBirth.day).toBe(20);
    expect(cred.claims.identity.dateOfBirth.month).toBe(3);
    expect(cred.claims.identity.dateOfBirth.year).toBe(1978);
    expect(cred.signature.leaves).toHaveLength(8);
  });
  it('should validate new defined credentials with the obligatory Meta:expiry UCA with null value', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', null, [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBeUndefined();
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.dateOfBirth.day).toBe(20);
    expect(cred.claims.identity.dateOfBirth.month).toBe(3);
    expect(cred.claims.identity.dateOfBirth.year).toBe(1978);
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issued' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:expiry' })).toBeDefined();
    expect(cred.expiry).toBeNull();
    expect(cred.signature.leaves).toHaveLength(7);
  });
  test('New Expirable Credentials', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', '-1d', [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBeUndefined();
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.dateOfBirth.day).toBe(20);
    expect(cred.claims.identity.dateOfBirth.month).toBe(3);
    expect(cred.claims.identity.dateOfBirth.year).toBe(1978);
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issued' })).toBeDefined();
    expect(cred.expiry).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:expiry' })).toBeDefined();
    expect(cred.signature.leaves).toHaveLength(7);
  });
  test('New Defined Credentials return the incorrect global Credential Identifier', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', null, [name, dob], '1');
    expect(cred.getGlobalCredentialItemIdentifier()).toBe('credential-civ:Credential:TestWithExcludes-1');
  });

  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], '1');
    return cred.requestAnchor().then((updated) => {
      expect(updated.signature.anchor.type).toBe('temporary');
      expect(updated.signature.anchor.value).not.toBeDefined();
      expect(updated.signature.anchor).toBeDefined();
      expect(updated.signature.anchor.schema).toBe('tbch-20180201');
      done();
    });
  });
  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], '1');
    // TODO refactor this to mock only attester.multiAttest inside this function
    cred.requestAnchor = jest.fn().mockImplementation(async () => {
      // mock the function or otherwise it would call the server
      const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
      const mockedVc = VC.fromJSON(JSON.parse(credentialContents));
      mockedVc.updateAnchor = jest.fn().mockImplementation(async () => mockedVc);
      return mockedVc;
    });
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
  test('Filter claims', () => {
    const civIdentityName = {
      first: 'Joao',
      middle: 'Barbosa',
      last: 'Santos',
    };

    const civIdentityDateOfBirth = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const nameUca = new UCA.IdentityName(civIdentityName);

    const dobUca = new UCA('civ:Identity:dateOfBirth', civIdentityDateOfBirth);

    const simpleIdentity = new VC('civ:Credential:SimpleIdentity', 'Civic-Identity-Verifier', null, [nameUca, dobUca], '1');

    const filtered = simpleIdentity.filter(['civ:Identity:name.first']);
    expect(filtered.claims.identity.name.first).toBeDefined();
    expect(filtered.claims.identity.name.last).not.toBeDefined();
    expect(filtered.claims.identity.name.middle).not.toBeDefined();
  });


  test('cred.verifyProofs(): with a valid cred without expiry, should return TRUE', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });


  test('cred.verify(): with a valid cred without expiry, should return at least VERIFY_LEVELS.PROOFS level', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verify()).toBeGreaterThanOrEqual(VC.VERIFY_LEVELS.PROOFS);
  });


  test('cred.verify(): VERIFY_LEVELS.PROOFS without expiry INVALID', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    // messing up with the targetHash:
    credJSon.signature.leaves[0].targetHash = credJSon.signature.leaves[0].targetHash.replace('a', 'b');
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verify()).toEqual(VC.VERIFY_LEVELS.INVALID);
  });

  it('should fail verification since it doesn\'t have an Meta:expiry UCA', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    // messing up with the targetHash:
    credJSon.signature.leaves[0].targetHash = credJSon.signature.leaves[0].targetHash.replace('a', 'b');
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeFalsy();
  });

  test('cred.verifyProofs(): with a valid cred with expiry, should return TRUE', () => {
    const credJSon = require('./fixtures/CredWithFutureExpiry.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  test('cred.verifyProofs(): with a valid cred but expired, should return FALSE', () => {
    const credJSon = require('./fixtures/CredExpired.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).not.toBeTruthy();
  });

  it('should fail verification since the leaf value is tampered', () => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCWithTamperedLeafValue.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred.verifyProofs()).not.toBeTruthy();
  });

  it('should check that signature matches for the root of the Merkle Tree', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    expect(await cred.verifySignature()).toBeTruthy();
    done();
  });

  it('should tamper the root of Merkle and the signature should not match', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    // tamper merkle root
    cred.signature.merkleRoot = 'gfdagfagfda';
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    expect(await cred.verifySignature()).toBeFalsy();
    done();
  });

  it('should check that the anchor exists on the chain', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    const validation = await cred.verifyAttestation();
    expect(validation).toBeTruthy();
    done();
  });

  it('should fail the check that the anchor exists on the chain', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCTempAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    const validation = await cred.verifyAttestation();
    expect(validation).toBeFalsy();
    done();
  });

  it('should fail the check with temporary attestations faked as permanent', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/CredentialAttestationFaked.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    try {
      await cred.verifyAttestation();
    } catch (err) {
      // TODO jests does not work with assert from node
      expect(err.message).toBe('Could not verify authority signature');
    }
    done();
  });

  it('should revoke the permanent anchor and succed verification', async (done) => {
    const timestamp = new Date().getTime();
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', `jest:test${timestamp}`, null, [name, dob], '1');
    await cred.requestAnchor();
    await cred.updateAnchor();
    const validation = await cred.verifyAttestation();
    if (validation) {
      const isRevoked = await cred.revokeAttestation();
      expect(isRevoked).toBeTruthy();
    }
    done();
  });

  it('should check an unrevoked attestation and validate that is not revoked', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.signature.anchor).toBeDefined();
    const isRevoked = await cred.isRevoked();
    expect(isRevoked).toBeFalsy();
    done();
  });
});
