const UCA = require('../../src/uca/UserCollectableAttribute');
const VC = require('../../src/creds/VerifiableCredential');
const _ = require('lodash');

jest.mock('../../src/creds/definitions');
jest.setTimeout(100000);

describe('VerifiableCredential', () => {
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
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], 1);
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBe('Barbosa');
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.DateOfBirth.day).toBe(20);
    expect(cred.claims.identity.DateOfBirth.month).toBe(3);
    expect(cred.claims.identity.DateOfBirth.year).toBe(1978);
    expect(cred.signature.leaves).toHaveLength(7);
  });
  test('New Defined Credentials', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', null, [name, dob], 1);
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBeUndefined();
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.DateOfBirth.day).toBe(20);
    expect(cred.claims.identity.DateOfBirth.month).toBe(3);
    expect(cred.claims.identity.DateOfBirth.year).toBe(1978);
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issued' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:expiry' })).not.toBeDefined();
    expect(cred.signature.leaves).toHaveLength(6);
  });
  test('New Expirable Credentials', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', '1d', [name, dob], 1);
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBeUndefined();
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.DateOfBirth.day).toBe(20);
    expect(cred.claims.identity.DateOfBirth.month).toBe(3);
    expect(cred.claims.identity.DateOfBirth.year).toBe(1978);
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:issued' })).toBeDefined();
    expect(cred.expiry).toBeDefined();
    expect(_.find(cred.signature.leaves, { identifier: 'civ:Meta:expiry' })).toBeDefined();
    expect(cred.signature.leaves).toHaveLength(7);
  });
  test('New Defined Credentials', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', null, [name, dob], 1);
    expect(cred).toBeDefined();
    expect(cred.claims.identity.name.first).toBe('Joao');
    expect(cred.claims.identity.name.middle).toBeUndefined();
    expect(cred.claims.identity.name.last).toBe('Santos');
    expect(cred.claims.identity.DateOfBirth.day).toBe(20);
    expect(cred.claims.identity.DateOfBirth.month).toBe(3);
    expect(cred.claims.identity.DateOfBirth.year).toBe(1978);
    expect(cred.signature.leaves).toHaveLength(6);
  });
  test('New Defined Credentials return the correct global Credential Identifier', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', null, [name, dob], 1);
    expect(cred.getGlobalCredentialItemIdentifier()).toBe('credential-civ:Credential:TestWithExcludes-1');
  });

  // TODO Reenable when BitGo Issue is resolved
  test.skip('Request anchor for Credential', () => {
    expect.assertions(2);
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], 1);
    return cred.requestAnchor().then((updated) => {
      expect(updated.signature.anchor).toBeDefined();
      expect(updated.signature.anchor.schema).toBe('tbch-20180201');
    });
  });
  test.skip('Refresh anchor for Credential', () => {
    expect.assertions(2);
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:SimpleTest', 'jest:test', null, [name, dob], 1);
    return cred.requestAnchor().then((updated) => {
      console.log(`#####${JSON.stringify(updated, null, 2)}`);
      expect(updated.signature.anchor).toBeDefined();
      return updated.updateAnchor().then((newUpdated) => {
        expect(newUpdated.signature.anchor).toBeDefined();
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

    const dobUca = new UCA('civ:Identity:DateOfBirth', civIdentityDateOfBirth);

    const simpleIdentity = new VC('civ:Credential:SimpleIdentity', 'Civic-Identity-Verifier', null, [nameUca, dobUca], '1');

    const filtered = simpleIdentity.filter(['civ:Identity:name.first']);
    expect(filtered.claims.identity.name.first).toBeDefined();
    expect(filtered.claims.identity.name.last).not.toBeDefined();
    expect(filtered.claims.identity.name.middle).not.toBeDefined();
  });
  test('Verify Levels / PROOFS', () => {
    // eslint-disable-next-line max-len
    const attestableNameValue = 's:0b5cbce9f91d64fc413bdc892017324a0cc1e4614e874056ed16cd8e08ac02de:Joao|s:2211b059eaece64918755075026cebd230e5c18ef883f5e68a196815804d2de3:Santos|s:1eab775b23947b2685ba1ecf5ec9333e3210b3aaaee40ce6dc1fc95ef2d6177e:Barbosa|';
    // eslint-disable-next-line max-len
    const attestableDoBValue = 'n:bdc52df4b0149beb3d67720e82bfd20e86d31e951bd66daeed8a87f3a998de49:00000020|n:0ff6a4dc3b4e7a0b2cfb3a9f0479dc89d9757736d7e46e31ddb3dc53a9179b56:00000003|n:ec4fcd9bad1839c052d0a23a9fba92eaf35d457e83ae50ea902bf3b5c3b490ad:00001978|';

    const nameT = new UCA('civ:Identity:name', { attestableValue: attestableNameValue });
    const dobT = new UCA('civ:Identity:DateOfBirth', { attestableValue: attestableDoBValue });
    const credT = new VC('civ:Credential:SimpleTest', 'jest:test', [nameT, dobT], 1);
    console.log(JSON.stringify(credT, null, 2));
    expect(credT.verify()).toBeGreaterThanOrEqual(VC.VERIFY_LEVELS.PROOFS);

    const credJSon = require('./fixtures/SimpleTest1.json'); // eslint-disable-line
    // const cred = VC.fromJSON(credJSon);
    // console.log(JSON.stringify(cred, null, 2));
    // expect(cred.verify()).toBeGreaterThanOrEqual(VC.VERIFY_LEVELS.PROOFS);
  });
});
