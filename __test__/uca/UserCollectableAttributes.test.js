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
    expect(v.version).toBeDefined();
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

  test('UCA return simple Attestatble Value', () => {
    const v = new UCA.IdentityNameFirst('Joao');
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    // console.log(attValues);
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe('civ:Identity:name.first');
    expect(attValues[0].value).toContain('s:');
    expect(attValues[0].value).toContain(':Joao');
  });

  test('UCA should Construct with a simple Attestatble Value', () => {
    const anAttestationValue = 's:873b59b3c4faa0c63e6ec788041291f36b915357cffaaf6c39661b2a94783d19:Joao';
    const v = new UCA.IdentityNameFirst({ attestableValue: anAttestationValue });
    expect(v).toBeDefined();
    // console.log(v);
    const attValues = v.getAttestableValues();
    // console.log(attValues);
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe('civ:Identity:name.first');
    expect(attValues[0].value).toContain('s:');
    expect(attValues[0].value).toContain(':Joao');
  });

  test('UCA return complex/multiple Attestatble Values', () => {
    const v = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    // console.log(attValues);
    expect(attValues).toHaveLength(4);
    expect(attValues[0].identifier).toBe('civ:Identity:name');
    expect(attValues[0].value).toContain('s:');
    expect(attValues[0].value).toContain(':Joao');
    expect(attValues[0].value).toContain(':Barbosa');
    expect(attValues[0].value).toContain(':Santos');
  });

  test('UCA should Construct with a complex Attestatble Value', () => {
    const vt = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    expect(vt).toBeDefined();
    // console.log(vt);
    // const attValue = vt.getAttestableValue();
    // console.log(attValue);

    // const v = new UCA.IdentityNameFirst({attestableValue: 's:ef4b3ba93b29295831d1d3e9fc350d59f9bf4f93b70d0e0f43fb458353ba0120'});
    // expect(v).toBeDefined();
    // console.log(v);
    // expect(attValues).toHaveLength(1);
    // expect(attValues[0].identifier).toBe('civ:Identity:name.first');
    // expect(attValues[0].value).toContain('s:');
    // expect(attValues[0].value).toContain(':Joao');
  });
});
