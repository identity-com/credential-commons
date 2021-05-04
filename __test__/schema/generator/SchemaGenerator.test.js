const SchemaGenerator = require('../../../src/schemas/generator/SchemaGenerator');

describe.skip('Schema Generator buid sample json tests', () => {
  it('Should create sample json with constraints and random returning higher value than definitions', () => {
    Math.random = function random() {
      return 99;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:date',
      version: '1',
      type: {
        properties: [{
          name: 'day',
          type: 'cvc:Type:day',
        },
        {
          name: 'month',
          type: 'cvc:Type:month',
        },
        {
          name: 'year',
          type: 'cvc:Type:year',
        }],
        required: ['day', 'month', 'year'],
      },
    });

    expect(json.day).toBeLessThanOrEqual(31);
    expect(json.day).toBeGreaterThanOrEqual(1);
    expect(json.month).toBeLessThanOrEqual(12);
    expect(json.month).toBeGreaterThanOrEqual(1);
    expect(json.year).toBeGreaterThanOrEqual(1900);
  });

  it('Should create sample json with constraints and random returning value lower than minimum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      minimum: 1,
    });

    expect(json).toBeGreaterThanOrEqual(1);
  });

  it('Should create sample json with constraints and random returning value lower than exclusiveMinimum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMinimum: 1,
    });

    expect(json).toBeGreaterThan(1);
  });

  it('Should create sample json with constraints and random returning value equals maximum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      maximum: 0,
    });

    expect(json).toBe(0);
  });

  it('Should create sample json with constraints and random returning value equals exclusiveMaximum', () => {
    Math.random = function random() {
      return 0;
    };

    const json = SchemaGenerator.buildSampleJson({
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMaximum: 0,
    });

    expect(json).toBe(-0.1);
  });

  it('Create schema for primitive type claim-cvc:PhoneNumber.country-v1', () => {
    const definition = {
      identifier: 'claim-cvc:Address.country-v1',
      version: '1',
      type: 'cvc:Type:country',
    };

    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });

  it('Create schema for primitive type claim-cvc:Medical.codes-v1', () => {
    const definition = {
      identifier: 'claim-cvc:Medical.codes-v1',
      version: '1',
      type: 'Array',
      items: {
        type: 'claim-cvc:Medical.code-v1',
      },
      credentialItem: false,
    };


    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });

  it('Create schema for primitive type claim-cvc:Vaccination.date-v1', () => {
    const definition = {
      identifier: 'claim-cvc:Vaccination.date-v1',
      version: '1',
      type: 'cvc:Type:timestamp',
      credentialItem: false,
    };


    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });

  it('Create schema for primitive type claim-cvc:Type.Name-v1', () => {
    const definition = {
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
        required: ['givenNames'],
      },
      credentialItem: true,
    };


    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });


  it('Create schema for primitive type cvc:Vaccination:record', () => {
    const definition = {
      identifier: 'cvc:Vaccination:record',
      version: '1',
      type: {
        properties: [
          {
            name: 'vaccinationId',
            type: 'cvc:Vaccination:id',
          },
          {
            name: 'dateOfAdministration',
            type: 'cvc:Vaccination:date',
          },
          {
            name: 'manufacturer',
            type: 'cvc:Vaccination:manufacturer',
          },
          {
            name: 'name',
            type: 'cvc:Vaccination:name',
          },
          {
            name: 'detail',
            type: 'cvc:Vaccination:recordDetail',
          },
          {
            name: 'organization',
            type: 'cvc:Type:organization',
          },
          {
            name: 'codes',
            type: 'cvc:Medical:codes',
          },
        ],
        required: ['vaccinationId', 'dateOfAdministration', 'name', 'organization'],
      },
      credentialItem: true,
    };


    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });

  it('Create schema for primitive type claim-cvc:Type.patient-v1', () => {
    const definition = {
      identifier: 'claim-cvc:Type.patient-v1',
      version: '1',
      type: {
        properties: [
          {
            name: 'fullName',
            type: 'cvc:Type:fullName',
          },
          {
            name: 'dateOfBirth',
            type: 'cvc:Type:date',
          },
        ],
      },
      required: ['name'],
      credentialItem: true,
    };

    const json = SchemaGenerator.buildSampleJson(definition);
    // eslint-disable-next-line no-unused-vars
    const jsonSchema = SchemaGenerator.process(definition, json);
  });
});
