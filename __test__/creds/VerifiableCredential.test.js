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
});
