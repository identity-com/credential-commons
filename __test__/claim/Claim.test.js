const { initialize } = require('../../src');
const { Claim } = require('../../src/entities/Claim');

const nameClaimData = {
  givenNames: 'Max',
  otherNames: 'Paul',
  familyNames: 'von und zu Mustermann',
};

describe('Claim Constructions tests', () => {
  // preload all the schemas
  beforeAll(initialize);

  test('unrecognised claim construction should fail', () => {
    const shouldThrow = () => new Claim('name.first', nameClaimData.givenNames);

    expect(shouldThrow).toThrowError('Invalid identifier name.first');
  });

  test('subclaim construction should succeed with a type reference', () => {
    const identifier = 'claim-cvc:Identity.name.givenNames-v1';
    const v = new Claim(identifier, nameClaimData.givenNames);
    expect(v.value).toEqual(nameClaimData.givenNames);
    expect(v.identifier).toEqual(identifier);
    expect(v.version).toEqual('1');
  });

  test('subclaim construction should succeed without a type reference', () => {
    const identifier = 'claim-cvc:Contact.phoneNumber.countryCode-v1';
    const v = new Claim(identifier, 'DE');
    expect(v.value).toEqual('DE');
    expect(v.identifier).toEqual(identifier);
    expect(v.version).toEqual('1');
  });

  // This flexibility (changing the nature of the identifier after construction)
  // is required in order to allow UCAs inherit from claims.
  test('changing the type to UCA should result in an accurate identifier', () => {
    const claimIdentifier = 'claim-cvc:Identity.name.givenNames-v1';
    const ucaIdentifier = 'uca-cvc:Identity.name.givenNames-v1';
    const v = new Claim(claimIdentifier, nameClaimData.givenNames);

    v.parsedIdentifier.type = 'uca';
    expect(v.identifier).toEqual(ucaIdentifier);
  });

  test('should not construct incomplete objects', () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      familyNames: nameClaimData.familyNames,
    };

    const shouldFail = () => new Claim(identifier, value);

    expect(shouldFail).toThrowError(/should have required property 'givenNames'/);
  });

  test('Claim cannot construct with an invalid day', () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 40,
      month: 11,
      year: 1978,
    };

    const shouldFail = () => new Claim(identifier, value);

    expect(shouldFail).toThrow();
  });

  test('Claim cannot construct with an invalid month', () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 13,
      year: 1978,
    };

    const shouldFail = () => new Claim(identifier, value);

    expect(shouldFail).toThrow();
  });

  test('Claim cannot construct with an invalid year', () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 3,
      year: -1,
    };

    const shouldFail = () => new Claim(identifier, value);

    expect(shouldFail).toThrow();
  });

  test('creation of Name must return type of object', () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: nameClaimData.givenNames,
    };
    const v = new Claim(identifier, value);
    expect(v.type).toEqual('object');
  });

  test('creates claim-cvc:Identity.name-v1', () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const v = new Claim(identifier, nameClaimData);

    expect(v.value).toEqual(nameClaimData);
  });

  test('creates claim-cvc:Identity.name-v1 with multiple first names', () => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: 'Max Paul',
      familyNames: nameClaimData.familyNames,
    };
    const v = new Claim(identifier, value);

    expect(v.value.givenNames).toEqual('Max Paul');
    expect(v.value.familyNames).toEqual(nameClaimData.familyNames);
  });

  test('creates a date of birth claim successfuly', () => {
    const identifier = 'claim-cvc:Identity.dateOfBirth-v1';
    const value = {
      day: 20,
      month: 3,
      year: 1973,
    };
    const v = new Claim(identifier, value);
    expect(v).toBeDefined();

    expect(v.value.day).toBe(value.day);
    expect(v.value.month).toBe(value.month);
    expect(v.value.year).toBe(value.year);
  });

  test('Construct Vaccination.Records successfully', () => {
    const identifier = 'claim-cvc:Vaccination.records-v1';
    const value = [{
      vaccinationId: 'vid15',
      dateOfAdministration: '150000001',
      name: 'Pfizer',
      manufacturer: {
        name: 'Pfizer',
        code: {
          name: 'codeName',
          code: 'codeCode',
          codeSystem: 'codeCodeSystem',
          codeSystemName: 'codeCodeSystemName',
        },
      },
      detail: {
        createdAt: {
          day: 2,
          month: 2,
          year: 1945,
        },
        updatedAt: {
          day: 2,
          month: 2,
          year: 1945,
        },
      },
      organization: {
        name: 'CVS',
      },
      codes: [
        {
          name: 'codeName1',
          code: 'codeCode1',
          codeSystem: 'codeCodeSystem1',
          codeSystemName: 'codeCodeSystemName1',
        },
        {
          name: 'codeName2',
          code: 'codeCode2',
          codeSystem: 'codeCodeSystem3',
          codeSystemName: 'codeCodeSystemName3',
        },
      ],
    },
    {
      vaccinationId: 'vid12',
      dateOfAdministration: '150000002',
      name: 'Pfizer',
      organization: {
        name: 'CVS',
      },
    },
    ];
    const claim = new Claim(identifier, value);
    expect(claim).toBeDefined();
    expect(claim.getAttestableValue());
    expect(claim.getAttestableValues());
  });

  test('Construct Tests.Records successfully', () => {
    const identifier = 'claim-cvc:Test.records-v1';
    const value = [
      {
        testId: 'tid99',
        testDate: '150000008',
        resultDate: '150000010',
        type: 'testType',
        result: 'negative',
        codes: [
          {
            name: 'codeName21',
            code: 'codeCode21',
            codeSystem: 'codeCodeSystem21',
            codeSystemName: 'codeCodeSystemName21',
          },
          {
            name: 'codeName22',
            code: 'codeCode22',
            codeSystem: 'codeCodeSystem23',
            codeSystemName: 'codeCodeSystemName23',
          },
        ],
      },
      {
        testId: 'tid95',
        testDate: '150000028',
        resultDate: '150000020',
        type: 'testType',
        result: 'negative',
      },
    ];
    const claim = new Claim(identifier, value);
    expect(claim).toBeDefined();
    expect(claim.getAttestableValue());
    expect(claim.getAttestableValues());
  });

  test('Construct Patient successfully', () => {
    const identifier = 'claim-cvc:Type.patient-v1';
    const value = {
      fullName: 'Patient Name',
      dateOfBirth: {
        day: 2,
        month: 2,
        year: 1945,
      },
    };
    const claim = new Claim(identifier, value);
    expect(claim).toBeDefined();
    expect(claim.getAttestableValue());
    expect(claim.getAttestableValues());
  });
  describe('Attestable values', () => {
    test('Claim should construct a complex Attestatble Value: claim-cvc:Identity.name-v1', () => {
      // eslint-disable-next-line max-len
      const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Mustermann|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Max|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Paul|';
      const v = new Claim('claim-cvc:Identity.name-v1', { attestableValue: aComplexAttestableValue });
      expect(v).toBeDefined();
    });

    test('Claim should create claim path correctly', () => {
      // eslint-disable-next-line max-len
      const aComplexAttestableValue = 'urn:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Mustermann|urn:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Max|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Paul|';
      const v = new Claim('claim-cvc:Identity.name-v1', { attestableValue: aComplexAttestableValue });

      expect(v).toBeDefined();
      const claimPath = v.getClaimPath();
      expect(claimPath).toBe('identity.name');
    });

    test('Claim should return empty array when parsing wrong attestable value', () => {
      const aComplexAttestableValue = { attestableValue: 'buren:name.familyNames:c443e0a97a2df34573f910927e25c58e597e211152dfb650e6210facacc1a065:Mustermann|buren:name.givenNames:f14ab211784a3b3d2f20d423847a775ad56c3be8104a51aa084f0c94756d953b:Max|urn:name.otherNames:09a31dab0a537ac5330a07df63effd9d2f55e91845956b58119843835f7dd9ed:Paul' };
      const shouldFail = () => Claim.parseAttestableValue(aComplexAttestableValue);
      expect(shouldFail).toThrow('Invalid attestableValue');
    });

    test('Claim with attestable value can be constructed and parsed', () => {
      const identifier = 'claim-cvc:Address.country-v1';
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

  test('construct a cvc:Meta:expirationDate', () => {
    const identifier = 'claim-cvc:Meta.expirationDate-v1';
    const isoDate = '2018-06-20T13:51:18.640Z';
    const v = new Claim(identifier, isoDate);
    expect(v.value).toEqual(isoDate);
  });

  test('Construct a claim-cvc:Contact.email-v1 claim', () => {
    const identifier = 'claim-cvc:Contact.email-v1';
    const email = new Claim(identifier, { username: nameClaimData.givenNames, domain: { name: 'civic', tld: 'com' } });
    expect(email.value.username).toBe(nameClaimData.givenNames);
    expect(email.value.domain.name).toBe('civic');
    expect(email.value.domain.tld).toBe('com');
  });

  test('Construct a claim-cvc:Contact.phoneNumber-v1', () => {
    const identifier = 'claim-cvc:Contact.phoneNumber-v1';
    const value = {
      country: 'DE',
      countryCode: '49',
      number: '17225252255',
      lineType: 'mobile',
      extension: '111',
    };
    const phone = new Claim(identifier, value);
    expect(phone.value).toEqual(value);
  });
});
