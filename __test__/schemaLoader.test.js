const {
  Claim,
  VC,
  schemaLoader,
  CVCSchemaLoader,
} = require('index');
const claimDefinitions = require('claim/definitions');
const credentialDefinitions = require('creds/definitions');

const credentialSubject = 'did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V';

const { summaryMap } = schemaLoader;

jest.setTimeout(30000);

describe('schema loading tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  it('test claim definition creation', async () => {
    expect(claimDefinitions)
      .toHaveLength(0);

    await Claim.create('claim-cvc:Identity.name-v1', {
      givenNames: 'Given',
      otherNames: 'Other',
      familyNames: 'Family',
    });

    expect(claimDefinitions)
      .toHaveLength(5);

    expect(claimDefinitions)
      .toEqual(expect.arrayContaining([
        {
          identifier: 'claim-cvc:Name.givenNames-v1',
          version: '1',
          type: 'String',
          credentialItem: true,
        },
        {
          identifier: 'claim-cvc:Name.familyNames-v1',
          version: '1',
          type: 'String',
          credentialItem: true,
        },
        {
          identifier: 'claim-cvc:Name.otherNames-v1',
          version: '1',
          type: 'String',
          credentialItem: true,
        },
        {
          identifier: 'claim-cvc:Type.Name-v1',
          version: '1',
          type: {
            properties: [
              {
                name: 'givenNames',
                type: 'claim-cvc:Name.givenNames-v1',
              },
              {
                name: 'familyNames',
                type: 'claim-cvc:Name.familyNames-v1',
              },
              {
                name: 'otherNames',
                type: 'claim-cvc:Name.otherNames-v1',
              },
            ],
            required: [
              'givenNames',
            ],
          },
          credentialItem: true,
        },
        {
          identifier: 'claim-cvc:Identity.name-v1',
          version: '1',
          type: 'claim-cvc:Type.Name-v1',
          credentialItem: true,
        },
      ]));
  });


  it('test vc', async () => {
    await Claim.create('cvc:Contact:phoneNumber', {
      country: 'BR',
      countryCode: '55',
      number: '31988889999',
      lineType: 'mobile',
    });
  });

  it('test credential definition creation', async () => {
    expect(credentialDefinitions)
      .toHaveLength(0);

    const name = await Claim.create('claim-cvc:Identity.name-v1', {
      givenNames: 'Given',
      otherNames: 'Other',
      familyNames: 'Family',
    });

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
      day: 1,
      month: 1,
      year: 1970,
    });

    await VC.create('credential-cvc:Identity-v3', 'issuer', null, credentialSubject, [name, dob]);

    expect(credentialDefinitions)
      .toHaveLength(1);

    expect(credentialDefinitions)
      .toEqual(expect.arrayContaining([
        expect.objectContaining({
          identifier: 'credential-cvc:Identity-v3',
          version: '3',
          depends: [
            'claim-cvc:Identity.name-v1',
            'claim-cvc:Identity.dateOfBirth-v1',
          ],
        }),
      ]));
  });

  it('test claim summary creation', async () => {
    await Claim.create('claim-cvc:Identity.name-v1', {
      givenNames: 'Given',
      otherNames: 'Other',
      familyNames: 'Family',
    });

    expect(summaryMap)
      .toEqual(expect.objectContaining({
        'name.givennames.claim': expect.objectContaining({
          identifier: 'claim-cvc:Name.givenNames-v1',
          textLabel: 'name.givennames.claim',
          labelFor: [
            'claim-cvc:Name.givenNames-v1',
          ],
          claimPath: 'name.givenNames',
        }),
        'name.familynames.claim': expect.objectContaining({
          identifier: 'claim-cvc:Name.familyNames-v1',
          textLabel: 'name.familynames.claim',
          labelFor: [
            'claim-cvc:Name.familyNames-v1',
          ],
          claimPath: 'name.familyNames',
        }),
        'name.othernames.claim': expect.objectContaining({
          identifier: 'claim-cvc:Name.otherNames-v1',
          textLabel: 'name.othernames.claim',
          labelFor: [
            'claim-cvc:Name.otherNames-v1',
          ],
          claimPath: 'name.otherNames',
        }),
        'type.name.claim': expect.objectContaining({
          identifier: 'claim-cvc:Type.Name-v1',
          textLabel: 'type.name.claim',
          labelFor: [
            'claim-cvc:Type.Name-v1',
          ],
          claimPath: 'Name',
        }),
        'identity.name.claim': expect.objectContaining({
          identifier: 'claim-cvc:Identity.name-v1',
          textLabel: 'identity.name.claim',
          labelFor: [
            'claim-cvc:Identity.name-v1',
          ],
          claimPath: 'identity.name',
        }),
      }));
  });

  it('test credential summary creation', async () => {
    const name = await Claim.create('claim-cvc:Identity.name-v1', {
      givenNames: 'Given',
      otherNames: 'Other',
      familyNames: 'Family',
    });

    const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
      day: 1,
      month: 1,
      year: 1970,
    });

    await VC.create('credential-cvc:Identity-v3', 'issuer', null, credentialSubject, [name, dob]);

    expect(summaryMap)
      .toEqual(expect.objectContaining({
        'identity.credential': {
          identifier: 'credential-cvc:Identity-v3',
          textLabel: 'identity.credential',
          credentials: [
            'credential-cvc:Identity-v3',
          ],
          labelFor: [
            'credential-cvc:Identity-v3',
          ],
          changeable: true,
          claimPath: null,
        },
      }));
  });

  it('should pass validation', async () => {
    await schemaLoader.validateSchema('claim-cvc:Identity.name-v1', {
      givenNames: 'Given',
      otherNames: 'Other',
      familyNames: 'Family',
    });
  });

  it('should fail validation', () => expect(schemaLoader.validateSchema('claim-cvc:Identity.name-v1', {
    otherNames: 'Other',
    familyNames: 'Family',
  }))
    .rejects
    .toThrow(/Missing required fields to claim-cvc:Identity.name-v1/));

  it('correctly loads an array type', async () => {
    const definition = {
      credentialItem: false,
      identifier: 'claim-cvc:Codes.records-v1',
      items: {
        type: 'claim-cvc:Medical.code-v1',
      },
      type: 'Array',
      version: '1',
    };

    await schemaLoader.loadSchemaFromTitle('claim-cvc:Codes.records-v1');

    expect(schemaLoader.definitions)
      .toEqual(expect.arrayContaining([expect.objectContaining(definition)]));
  });
});
