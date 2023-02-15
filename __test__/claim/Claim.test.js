const { Claim } = require('claim/Claim');
const { schemaLoader, CVCSchemaLoader, UserCollectableAttribute } = require('index');

jest.setTimeout(30000);

describe('Claim Constructions tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  test('Claim construction should fails',
    async () => expect(Claim.create('name.first', 'joao'))
      .rejects.toThrow(/name.first is not defined/));

  test('Claim construction should succeed', async () => {
    const v = await Claim.create('claim-cvc:Name.givenNames-v1', 'joao');
    expect(v).toBeDefined();
  });

  test('Claim should have identifier', async () => {
    const identifier = 'claim-cvc:Name.givenNames-v1';
    const v = await Claim.create(identifier, 'joao');
    expect(v).toBeDefined();
    expect(v.identifier).toEqual(identifier);
    expect(v.version).toBeDefined();
  });

  test('Claim dont construct incomplete objects', () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      familyNames: 'santos',
    };

    return expect(Claim.create(identifier, value)).rejects
      .toThrow(/Missing required fields to claim-cvc:Identity.name-v1/);
  });

  test('Claim dont construct invalid day', () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 40,
      month: 13,
      year: 1978,
    };

    return Claim.create(identifier, value).catch(e => expect(e).toBeDefined());
  });

  test('Claim dont construct invalid month', async () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 13,
      year: 1978,
    };

    return Claim.create(identifier, value).catch(e => expect(e).toBeDefined());
  });

  test('Claim dont construct invalid year', async () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 3,
      year: -1,
    };

    return Claim.create(identifier, value).catch(e => expect(e).toBeDefined());
  });

  test('cvc:Verify:phoneNumberToken must have type equals String', async () => {
    const identifier = 'cvc:Verify:phoneNumberToken';
    const value = '12345';
    const v = await Claim.create(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('String');
  });

  test('Creation of Name must return type of object', async () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: 'joao',
    };
    const v = await Claim.create(identifier, value);
    expect(v).toBeDefined();
    expect(v.type).toEqual('Object');
  });

  test('Creation of claim-cvc:Identity.name-v1 successfuly', async () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: 'Joao Paulo',
      familyNames: 'Barbosa Marques dos Santos',
    };
    const v = await Claim.create(identifier, value);

    expect(v).toBeDefined();
    expect(v.value).toHaveProperty('givenNames');
    expect(v.value.givenNames.value).toEqual('Joao Paulo');
    expect(v.value).toHaveProperty('familyNames');
    expect(v.value.familyNames.value).toEqual('Barbosa Marques dos Santos');
  });

  test('Creating date of birth Claim successfuly', async () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const v = await Claim.create(identifier, value);
    expect(v).toBeDefined();
    expect(v.value.day.value).toBe(value.day);
    expect(v.value.month.value).toBe(value.month);
    expect(v.value.year.value).toBe(value.year);
  });

  test('Construct Patient successfully', async () => {
    const identifier = 'claim-cvc:Type.patient-v1';
    const value = {
      fullName: 'Patient Name',
      dateOfBirth: {
        day: 2,
        month: 2,
        year: 1945,
      },
    };

    const claim = await Claim.create(identifier, value);
    expect(claim).toBeDefined();
    expect(claim.getAttestableValue());
    expect(claim.getAttestableValues());
  });

  test('Construct by NameGivenNames must result successfully', async () => {
    const v = await Claim.create('cvc:Name:givenNames', 'Joao');
    expect(v).toBeDefined();
    expect(v.value).toBe('Joao');
  });

  test('Construct IdentityName must result successfully', async () => {
    const value = { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' };
    const v = await Claim.create('claim-cvc:Identity.name-v1', value);
    expect(v).toBeDefined();
    expect(v.value.givenNames.value).toBe(value.givenNames);
    expect(v.value.otherNames.value).toBe(value.otherNames);
    expect(v.value.familyNames.value).toBe(value.familyNames);
  });

  test('Claim should construct a complex Attestatble Value: claim-cvc:Identity.name-v1', async () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const v = await Claim.create('claim-cvc:Identity.name-v1', { attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
  });

  test('Claim should create claim path correctly', async () => {
    // eslint-disable-next-line max-len
    const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa|';
    const v = await Claim.create('claim-cvc:Identity.name-v1', { attestableValue: aComplexAttestableValue });
    expect(v).toBeDefined();
    const claimPath = v.getClaimPath();
    expect(claimPath).toBe('identity.name');
  });

  test('Claim should return empty array when parsing wrong attestable value', async () => {
    try {
      // eslint-disable-next-line max-len
      const aComplexAttestableValue = { attestableValue: 'buren:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Santos|buren:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Joao|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Barbosa' };
      Claim.parseAttestableValue(aComplexAttestableValue);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe('Invalid attestableValue');
    }
  });

  test('Construct a cvc:Meta:expirationDate', async () => {
    const identifier = 'cvc:Meta:expirationDate';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = await Claim.create(identifier, isoDate);
    expect(v).toBeDefined();
  });

  test('Get global identifier of a Claim', async () => {
    const identifier = 'cvc:Meta:expirationDate';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = await Claim.create(identifier, isoDate);
    expect(v).toBeDefined();
    expect(v.getGlobalIdentifier()).toBe(`claim-${identifier}-1`);
  });

  test('Construct a claim-cvc:Contact.email-v1 Claim', async () => {
    const identifier = 'claim-cvc:Contact.email-v1';
    const email = await Claim.create(identifier, { username: 'joao', domain: { name: 'civic', tld: 'com' } });
    const plain = email.getPlainValue();
    expect(plain.username).toBe('joao');
    expect(plain.domain).toBeDefined();
    expect(plain.domain.name).toBe('civic');
    expect(plain.domain.tld).toBe('com');
  });

  test('Construct a claim-cvc:Contact.phoneNumber-v1', async () => {
    const identifier = 'claim-cvc:Contact.phoneNumber-v1';
    const phone = await Claim.create(identifier, {
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

  test('Construct claim-cvc:Type.address-v1', async () => {
    const identifier = 'claim-cvc:Type.address-v1';
    const address = await Claim.create(identifier, {
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

  test('Should get ALL Claim properties email', async () => {
    const properties = await Claim.getAllProperties('claim-cvc:Contact.email-v1');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('contact.email.username');
    expect(properties).toContain('contact.email.domain.name');
    expect(properties).toContain('contact.email.domain.tld');
  });

  test('Should get ALL Claim properties name', async () => {
    const properties = await Claim.getAllProperties('claim-cvc:Identity.name-v1');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('identity.name.givenNames');
    expect(properties).toContain('identity.name.familyNames');
    expect(properties).toContain('identity.name.otherNames');
  });

  test('Claim with attestable value must constructed and parsed', async () => {
    const identifier = 'claim-cvc:Type.address-v1';
    const attestableValue = {
      country: 'DE',
      state: 'Berlin',
      county: 'Berlin',
      city: 'Berlin',
      postalCode: '15123',
      street: 'Ruthllardstr',
      unit: '12',
      // attestableValue: 'Mocked:asdkmalsdqasd',
    };
    const uca = await Claim.create(identifier, attestableValue);
    expect(uca).toBeDefined();
    expect(uca.value).toBeDefined();
  });

  test('Transforming UCA to Claim', async () => {
    const identifier = 'cvc:Identity:dateOfBirth';
    const value = {
      day: 20,
      month: 12,
      year: 1978,
    };

    const dateOfBirthUCA = await UserCollectableAttribute.create(identifier, value);
    expect(dateOfBirthUCA).toBeDefined();
    expect(dateOfBirthUCA.value).toBeDefined();
    expect(dateOfBirthUCA.value.day).toBeDefined();
    expect(dateOfBirthUCA.value.day.value).toBe(20);

    // converting UCA to Claim
    const dateOfBirthClaim = await Claim.create(identifier, dateOfBirthUCA.getPlainValue());

    expect(dateOfBirthClaim).toBeDefined();
    expect(dateOfBirthClaim.value).toBeDefined();
    expect(dateOfBirthClaim.value.day).toBeDefined();
    expect(dateOfBirthClaim.value.day.value).toBe(20);
    expect(dateOfBirthClaim.identifier).toBe('claim-cvc:Identity.dateOfBirth-v1');
  });

  test('Transforming alias UCA to Claim', async () => {
    const identifier = 'cvc:Document:evidences';
    const aliasIdentifier = 'cvc:Validation:evidences';
    const value = {
      idDocumentFront: { algorithm: 'sha256', data: 'sha256(idDocumentFront)' },
      idDocumentBack: { algorithm: 'sha256', data: 'sha256(idDocumentBack)' },
      selfie: { algorithm: 'sha256', data: 'sha256(selfie)' },
    };

    const evidencesUCA = await UserCollectableAttribute.create(identifier, value);
    const evidencesAliasUCA = await UserCollectableAttribute.create(aliasIdentifier, value);

    // converting UCAs to Claims
    const evidencesClaim = await Claim.create(identifier, evidencesUCA.getPlainValue());
    const evidencesClaimForAliasUCA = await Claim.create(aliasIdentifier, evidencesAliasUCA.getPlainValue());

    // should map to the same claim
    expect(evidencesClaimForAliasUCA.identifier).toEqual(evidencesClaim.identifier);
    expect(evidencesClaimForAliasUCA.getPlainValue()).toEqual(evidencesClaim.getPlainValue());
    expect(evidencesClaim.identifier).toBe('claim-cvc:Document.evidences-v1');
  });
});
