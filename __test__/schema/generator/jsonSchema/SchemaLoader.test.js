const { schemaLoader } = require('../../../../src/schemas/jsonSchema');
const { CVCSchemaLoader } = require('../../../../src/schemas/jsonSchema/loaders/cvc');
const { UCASchemaLoader } = require('../../../../src/schemas/jsonSchema/loaders/uca');
const { Claim } = require('../../../../src/claim/Claim');

describe('Schema Loading Tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
    schemaLoader.addLoader(new UCASchemaLoader());
  });

  it('should validate claim-cvc:Email.domain-v1 claim', () => {
    schemaLoader.validateSchema('claim-cvc:Email.domain-v1', {
      name: 'test',
      tld: 'org',
    });
  });

  it('should validate claim-cvc:Identity.name-v1 claim', () => {
    schemaLoader.validateSchema('claim-cvc:Identity.name-v1', {
      givenNames: 'givenNames',
      familyNames: 'familyNames',
      otherNames: 'otherNames',
    });
  });

  it('should validate claim-cvc:Type.Name-v1 claim', () => {
    schemaLoader.validateSchema('claim-cvc:Type.Name-v1', {
      givenNames: 'givenNames',
      familyNames: 'familyNames',
      otherNames: 'otherNames',
    });
  });

  it('should dynamically load a schema', () => {
    schemaLoader.validateSchema('claim-cvc:Document.evidences-v1', {
      idDocumentFront: {
        algorithm: 'sha256',
        data: 'data',
      },
    });

    schemaLoader.loadSchemaFromTitle('claim-cvc:Document.evidences-v1');
  });

  it('should generate old definitions', () => {
    schemaLoader.loadSchemaFromTitle('claim-cvc:Document.evidences-v1');
    schemaLoader.loadSchemaFromTitle('claim-cvc:Type.Name-v1');
    schemaLoader.loadSchemaFromTitle('claim-cvc:Email.domain-v1');
  });

  it('should generate old definitions from claim-cvc:Medical.codes-v1', () => {
    schemaLoader.loadSchemaFromTitle('claim-cvc:Medical.codes-v1');
  });

  it('should generate old definitions from claim-cvc:Identity.name-v1', () => {
    schemaLoader.loadSchemaFromTitle('claim-cvc:Identity.name-v1');

    // eslint-disable-next-line no-unused-vars
    const claim = new Claim('claim-cvc:Identity.name-v1', {
      givenNames: 'givenNames',
      familyNames: 'familyNames',
      otherNames: 'otherNames',
    });
  });

  it('should validate against schema', () => {
    schemaLoader.validateSchema('claim-cvc:Address.country-v1', 'country');
  });

  it('should validate against schema of type cvc:Type:date', () => {
    schemaLoader.validateSchema('cvc:Type:date', {
      day: 1,
      month: 2,
      year: 2020,
    });
  });

  it('should validate against schema of type claim-cvc:Type.patient-v1', () => {
    schemaLoader.loadSchemaFromTitle('claim-cvc:Type.patient-v1');

    schemaLoader.validateSchema('claim-cvc:Type.patient-v1', {
      fullName: 'Patient Name',
      dateOfBirth: {
        day: 2,
        month: 2,
        year: 1945,
      },
    });
  });

  it('should validate against schema of type claim-cvc:Medical.covid19-v1', () => {
    schemaLoader.loadSchemaFromTitle('claim-cvc:Medical.covid19-v1');
  });
});
