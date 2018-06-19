const UCA = require('../../src/uca/UserCollectableAttribute');

describe('UCA Constructions tests', () => {
  test('UCA construction should fails', () => {
    function createUCA() {
      return new UCA('name.first', 'joao');
    }

    expect(createUCA).toThrowError('name.first is not defined');
  });

  test('UCA construction should succeed', () => {
    const v = new UCA('civ:Identity:name.first', 'joao');
    expect(v).toBeDefined();
  });

  test('UCA return the correct global Credential Identifier', () => {
    const v = new UCA('civ:Identity:name.first', 'joao', '1');
    expect(v.getGlobalCredentialItemIdentifier()).toBe('uca-civ:Identity:name.first-1');
  });

  test('UCA should have identifier', () => {
    const identifier = 'civ:Identity:name.first';
    const v = new UCA(identifier, 'joao');
    expect(v).toBeDefined();
    expect(v.identifier).toEqual(identifier);
  });

  test('UCA dont construct incomplete objects', () => {
    const identifier = 'civ:Identity:name';
    const value = {
      last: 'santos',
    };
    function createUCA() {
      return new UCA(identifier, value);
    }

    expect(createUCA).toThrowError('Missing required fields to civ:Identity:name');
  });

  test('UCA dont construct invalid day', () => {
    const identifier = 'civ:Identity:DateOfBirth';
    const value = {
      day: 40,
      month: 13,
      year: 1978,
    };
    function createUCA() {
      return new UCA(identifier, value);
    }

    expect(createUCA).toThrow();
  });

  test('UCA dont construct invalid month', () => {
    const identifier = 'civ:Identity:DateOfBirth';
    const value = {
      day: 20,
      month: 13,
      year: 1978,
    };
    function createUCA() {
      return new UCA(identifier, value);
    }

    expect(createUCA).toThrow();
  });

  test('UCA dont construct invalid year', () => {
    const identifier = 'civ:Identity:DateOfBirth';
    const value = {
      day: 20,
      month: 3,
      year: -1,
    };
    function createUCA() {
      return new UCA(identifier, value);
    }

    expect(createUCA).toThrow();
  });


  test('UCA has type String', () => {
    const identifier = 'civ:Verify:phoneNumber.Token';
    const value = '12345';
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('String');
  });

  test('UCA has type Object:civ:Identity:name', () => {
    const identifier = 'civ:Identity:name';
    const value = {
      first: 'joao',
    };
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('Object');
  });

  test('UCA has correct object value', () => {
    const identifier = 'civ:Identity:name';
    const value = {
      first: 'Joao',
      middle: 'Paulo',
      last: 'Santos',
    };
    const v = new UCA(identifier, value);

    expect(v).toBeDefined();
    expect(v.value).toHaveProperty('first');
    expect(v.value.first.value).toEqual('Joao');
    expect(v.value).toHaveProperty('middle');
    expect(v.value.middle.value).toEqual('Paulo');
    expect(v.value).toHaveProperty('last');
    expect(v.value.last.value).toEqual('Santos');
  });

  test('UCA has correct complex object value', () => {
    const identifier = 'civ:Identity:DateOfBirth';
    const value = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
  });


  test('Construct IdentityNameFirst', () => {
    const v = new UCA.IdentityNameFirst('Joao');
    expect(v).toBeDefined();
  });

  test('Construct IdentityNameFirst', () => {
    const v = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    expect(v).toBeDefined();
  });

  test('UCA return Attestatble values', () => {
    const v = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(4);
  });
});
