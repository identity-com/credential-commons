const { Claim } = require('../../src/claim/Claim');

describe('Claim Constructions tests', () => {
  test('Claim construction should fails', () => {
    function createClaim() {
      return new Claim('name.first', 'joao');
    }

    expect(createClaim).toThrowError('name.first is not defined');
  });

  test('Claim construction should succeed', () => {
    const v = new Claim('cvc:Name:givenNames', 'joao');
    expect(v).toBeDefined();
  });

  test('Claim should have identifier', () => {
    const identifier = 'cvc:Name:givenNames';
    const v = new Claim(identifier, 'joao');
    expect(v).toBeDefined();
    expect(v.identifier).toEqual(identifier);
    expect(v.version).toBeDefined();
  });

  test('Claim dont construct incomplete objects', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      familyNames: 'santos',
    };

    function createClaim() {
      return new Claim(identifier, value);
    }

    expect(createClaim).toThrowError('Missing required fields to cvc:Identity:name');
  });

  test('Claim dont construct invalid day', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 40,
      month: 13,
      year: 1978,
    };

    function createClaim() {
      return new Claim(identifier, value);
    }

    expect(createClaim).toThrow();
  });

  test('Claim dont construct invalid month', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 20,
      month: 13,
      year: 1978,
    };

    function createClaim() {
      return new Claim(identifier, value);
    }

    expect(createClaim).toThrow();
  });

  test('Claim dont construct invalid year', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 20,
      month: 3,
      year: -1,
    };

    function createClaim() {
      return new Claim(identifier, value);
    }

    expect(createClaim).toThrow();
  });


  test('cvc:Verify:phoneNumberToken must have type equals String', () => {
    const identifier = 'cvc:Verify:phoneNumberToken';
    const value = '12345';
    const v = new Claim(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('String');
  });

  test('Creation of Name must return type of object', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'joao',
    };
    const v = new Claim(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('Object');
  });

  test('Creation of cvc:Identity:name successfuly', () => {
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'Joao Paulo',
      familyNames: 'Barbosa Marques dos Santos',
    };
    const v = new Claim(identifier, value);

    expect(v).toBeDefined();
    expect(v.value).toHaveProperty('givenNames');
    expect(v.value.givenNames.value).toEqual('Joao Paulo');
    expect(v.value).toHaveProperty('familyNames');
    expect(v.value.familyNames.value).toEqual('Barbosa Marques dos Santos');
  });

  test('Creating date of birth Claim successfuly', () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const v = new Claim(identifier, value);
    expect(v).toBeDefined();
    expect(v.value.day.value).toBe(value.day);
    expect(v.value.month.value).toBe(value.month);
    expect(v.value.year.value).toBe(value.year);
  });

  test('Construct by NameGivenNames must result successfuly', () => {
    const v = new Claim.NameGivenNames('Joao');
    expect(v).toBeDefined();
    expect(v.value).toBe('Joao');
  });

  test('Construct IdentityName must result successfuly', () => {
    const value = { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' };
    const v = new Claim.IdentityName(value);
    expect(v).toBeDefined();
    expect(v.value.givenNames.value).toBe(value.givenNames);
    expect(v.value.otherNames.value).toBe(value.otherNames);
    expect(v.value.familyNames.value).toBe(value.familyNames);
  });

  test('Claim should construct a complex Attestatble Value: cvc:Identity:name', () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const v = new Claim.IdentityName({ attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
  });

  test('Claim should create claim path correctly', () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const v = new Claim.IdentityName({ attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
    const claimPath = v.getClaimPath();
    expect(claimPath).toBe('identity.name');
  });

  test('Claim should return empty array when parsing wrong attestable value', () => {
    try {
      // eslint-disable-next-line max-len
      const aComplexAttestableValue = { attestableValue: 'buren:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|buren:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa' };
      Claim.parseAttestableValue(aComplexAttestableValue);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe('Invalid attestableValue');
    }
  });

  test('Construct a cvc:Meta:expirationDate', () => {
    const identifier = 'cvc:Meta:expirationDate';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = new Claim(identifier, isoDate);
    expect(v).toBeDefined();
  });

  test('Get global identifier of a Claim', () => {
    const identifier = 'cvc:Meta:expirationDate';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = new Claim(identifier, isoDate);
    expect(v).toBeDefined();
    expect(v.getGlobalCredentialItemIdentifier()).toBe(`claim-${identifier}-1`);
  });

  test('Construct a cvc:Contact:email Claim', () => {
    const identifier = 'cvc:Contact:email';
    const email = new Claim(identifier, { username: 'joao', domain: { name: 'civic', tld: 'com' } });
    const plain = email.getPlainValue();
    expect(plain.username).toBe('joao');
    expect(plain.domain).toBeDefined();
    expect(plain.domain.name).toBe('civic');
    expect(plain.domain.tld).toBe('com');
  });

  test('Construct a cvc:Contact:phoneNumber', () => {
    const identifier = 'cvc:Contact:phoneNumber';
    const phone = new Claim(identifier, {
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
    const address = new Claim(identifier, {
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
    expect(address.id).toBeDefined();
  });

  test('Should get ALL Claim properties email', () => {
    const properties = Claim.getAllProperties('cvc:Contact:email');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('contact.email.username');
    expect(properties).toContain('contact.email.domain.name');
    expect(properties).toContain('contact.email.domain.tld');
  });

  test('Should get ALL Claim properties name', () => {
    const properties = Claim.getAllProperties('cvc:Identity:name');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('identity.name.givenNames');
    expect(properties).toContain('identity.name.familyNames');
    expect(properties).toContain('identity.name.otherNames');
  });

  test('Claim with attestable value must constructed and parsed', () => {
    const identifier = 'cvc:Type:address';
    const attestableValue = {
      country: 'DE',
      state: 'Berlin',
      county: 'Berlin',
      city: 'Berlin',
      postalCode: '15123',
      street: 'Ruthllardstr',
      unit: '12',
      attestableValue: 'Mocked:asdkmalsdqasd',
    };
    const uca = new Claim(identifier, attestableValue);
    expect(uca).toBeDefined();
    expect(uca.value).toBeDefined();
  });
});
