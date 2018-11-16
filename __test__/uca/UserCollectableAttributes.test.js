const _ = require('lodash');
const UCA = require('../../src/uca/UserCollectableAttribute');
const definitions = require('../../src/uca/definitions');

describe('UCA Constructions tests', () => {
  test('UCA construction should fails', () => {
    function createUCA() {
      return new UCA('name.first', 'joao');
    }

    expect(createUCA).toThrowError('name.first is not defined');
  });

  test('UCA construction should succeed', () => {
    const v = new UCA('cvc:Name:givenNames', 'joao');
    expect(v).toBeDefined();
  });

  test('UCA return the incorrect global Credential Identifier', () => {
    const v = new UCA('cvc:Name:givenNames', 'joao', '1');
    expect(v.getGlobalCredentialItemIdentifier()).toBe('claim-cvc:Name:givenNames-1');
  });

  test('UCA should have identifier', () => {
    const identifier = 'cvc:Name:givenNames';
    const v = new UCA(identifier, 'joao');
    expect(v).toBeDefined();
    expect(v.identifier).toEqual(identifier);
    expect(v.version).toBeDefined();
  });

  test('UCA dont construct incomplete objects', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      familyNames: 'santos',
    };
    function createUCA() {
      return new UCA(identifier, value);
    }

    expect(createUCA).toThrowError('Missing required fields to cvc:Identity:name');
  });

  test('UCA dont construct invalid day', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
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
    const identifier = 'cvc:Identity:dateOfBirth';
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
    const identifier = 'cvc:Identity:dateOfBirth';
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
    const identifier = 'cvc:Verify:phoneNumberToken';
    const value = '12345';
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('String');
  });

  test('UCA has type Object:cvc:Identity:name', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'joao',
    };
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('Object');
  });

  test('UCA has incorrect object value', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'Joao Paulo',
      familyNames: 'Barbosa Marques dos Santos',
    };
    const v = new UCA(identifier, value);

    expect(v).toBeDefined();
    expect(v.value).toHaveProperty('givenNames');
    expect(v.value.givenNames.value).toEqual('Joao Paulo');
    expect(v.value).toHaveProperty('familyNames');
    expect(v.value.familyNames.value).toEqual('Barbosa Marques dos Santos');
  });

  test('UCA has incorrect complex object value', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const v = new UCA(identifier, value);
    expect(v).toBeDefined();
  });


  test('Construct NameGivenNames', () => {
    const v = new UCA.NameGivenNames('Joao');
    expect(v).toBeDefined();
  });

  test('Construct NameGivenNames', () => {
    const v = new UCA.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    expect(v).toBeDefined();
  });

  test('UCA return simple Attestatble Value', () => {
    const v = new UCA.NameGivenNames('Joao');
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe('cvc:Name:givenNames');
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':Joao');
  });

  test('UCA should Construct with a simple Attestatble Value', () => {
    const aSingleAttestationValue = 'urn:givenNames:873b59b3c4faa0c63e6ec788041291f36b915357cffaaf6c39661b2a94783d19:Joao';
    const v = new UCA.NameGivenNames({ attestableValue: aSingleAttestationValue });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe('cvc:Name:givenNames');
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':Joao');
  });

  test('UCA return complex/multiple Attestatble Values', () => {
    const v = new UCA.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(4);
    expect(attValues[0].identifier).toBe('cvc:Identity:name');
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':Joao');
    expect(attValues[0].value).toContain(':Barbosa');
    expect(attValues[0].value).toContain(':Santos');
  });

  test('UCA should Construct with a complex Attestatble Value: cvc:Identity:name', () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const v = new UCA.IdentityName({ attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(4);
    expect(attValues[0].identifier).toBe('cvc:Identity:name');
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':Joao');
    expect(attValues[0].value).toContain(':Barbosa');
    expect(attValues[0].value).toContain(':Santos');
  });

  test('UCA should Construct with a complex Attestable Value: IdentityName syntax\'s sugar', () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const identifier = 'cvc:Identity:name';
    const v = new UCA(identifier, { attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(4);
    expect(attValues[0].identifier).toBe(identifier);
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain('c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065');
    expect(attValues[0].value).toContain(':Joao');
    expect(attValues[0].value).toContain(':Barbosa');
    expect(attValues[0].value).toContain(':Santos');
  });

  test('UCA should Construct with a complex Attestatble Value: cvc:Identity:dateOfBirth', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:dateOfBirth.day:576cdcffe0efe478a711b2955b66efbd9c03bef0791aaccc01eaf84d707bb9c6:00000020|urn:dateOfBirth.month:ccbdeed0346e7ea075b0273c5b9fd075d2dcb899d5516688be3a02d1016e1d7f:00000003|urn:dateOfBirth.year:ef71aaef649aa76254abdfe9661ed9f14ebae5139a959baa462c0ac0629f32fc:00001978|';

    const v = new UCA(identifier, { attestableValue: aComplexAttestableValue });
    const attestableValue = v.getAttestableValue();
    expect(attestableValue).toBe(aComplexAttestableValue);
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe(identifier);
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':576cdcffe0efe478a711b2955b66efbd9c03bef0791aaccc01eaf84d707bb9c6');
    expect(attValues[0].value).toContain(':00000020');
    expect(attValues[0].value).toContain(':00000003');
    expect(attValues[0].value).toContain(':00001978');
  });

  test('Construct a cvc:Meta:expirationDate', () => {
    const identifier = 'cvc:Meta:expirationDate';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = new UCA(identifier, isoDate);
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe(identifier);
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(`:${isoDate}`);
  });

  test('Construct a cvc:Meta:expirationDate as a Attestable Value', () => {
    const identifier = 'cvc:Meta:expirationDate';
    const anAttestationValue = 'urn:expirationDate:9dabdd37eca1bc98bcc725d66c77f10707fa9f3292752a31ad9dd94d17557e81:2018-06-20T13:51:18.640Z';
    const v = new UCA(identifier, { attestableValue: anAttestationValue });
    expect(v).toBeDefined();
    const attValues = v.getAttestableValues();
    expect(attValues).toHaveLength(1);
    expect(attValues[0].identifier).toBe(identifier);
    expect(attValues[0].value).toContain('urn:');
    expect(attValues[0].value).toContain(':2018-06-20T13:51:18.640Z');
  });

  test('Construct a cvc:Identity.name without one the last property value', () => {
    const identifier = 'cvc:Identity:name';
    // eslint-disable-next-line max-len
    const attestationValue = 'urn:name.familyNames:50f50f97af7e3c9ebf3ad8df4852ea29a8227a49feb8db071fc06d69b3717608:Santos|urn:name.givenNames:84b0b0bcc790cfea08d6268a42aaac708b6ff843754d126eb21257ed4787639f:Joao|';
    const v = new UCA(identifier, { attestableValue: attestationValue });
    expect(v).toBeDefined();
    expect(v.last).toBeUndefined();
  });

  test('Construct a cvc:Contact:email UCA', () => {
    const identifier = 'cvc:Contact:email';
    const email = new UCA(identifier, { username: 'joao', domain: { name: 'civic', tld: 'com' } });
    const plain = email.getPlainValue();
    expect(plain.username).toBe('joao');
    expect(plain.domain).toBeDefined();
    expect(plain.domain.name).toBe('civic');
    expect(plain.domain.tld).toBe('com');
  });

  test('Construct a cvc:Contact:phoneNumber', () => {
    const identifier = 'cvc:Contact:phoneNumber';
    const phone = new UCA(identifier, {
      country: 'DE',
      countryCode: '49',
      number: '17225252255',
      lineType: 'mobile',
      extension: '111',
    });
    const plain = phone.getPlainValue();
    expect(plain.country).toBe('DE');
    expect(plain.countryCode).toBe('49');
    expect(plain.number).toBe('17225252255');
    expect(plain.extension).toBe('111');
    expect(plain.lineType).toBe('mobile');
  });

  test('Construct cvc:Type:address', () => {
    const identifier = 'cvc:Type:address';
    const address = new UCA(identifier, {
      country: 'DE',
      state: 'Berlin',
      county: 'Berlin',
      city: 'Berlin',
      postalCode: '15123',
      street: 'Ruthllardstr',
      unit: '12',
    });

    const plain = address.getPlainValue();
    expect(plain.country).toBe('DE');
    expect(plain.state).toBe('Berlin');
    expect(plain.county).toBe('Berlin');
    expect(plain.city).toBe('Berlin');
    expect(plain.unit).toBe('12');
    expect(plain.postalCode).toBe('15123');
    expect(plain.street).toBe('Ruthllardstr');
  });

  test('Should get ALL UCA properties email', () => {
    const properties = UCA.getAllProperties('cvc:Contact:email');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('contact.email.username');
    expect(properties).toContain('contact.email.domain.name');
    expect(properties).toContain('contact.email.domain.tld');
  });

  test('Should get ALL UCA properties name', () => {
    const properties = UCA.getAllProperties('cvc:Identity:name');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('identity.name.givenNames');
    expect(properties).toContain('identity.name.familyNames');
    expect(properties).toContain('identity.name.otherNames');
  });
});
