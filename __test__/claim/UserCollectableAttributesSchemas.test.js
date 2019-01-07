const Ajv = require('ajv');
const { Claim, definitions } = require('../../src/claim/Claim');
const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');

describe('UCA Json Sample Date Construction tests', () => {
  it('Should generate UCA JSON Sample Data from all coded identifiers and succeed', async (done) => {
    definitions.forEach((definition) => {
      const json = SchemaGenerator.buildSampleJson(definition);
      expect(typeof json).toEqual('object');
    });
    done();
  });

  it('Should generate Sample Data from all UCA and then create the json schema', async (done) => {
    definitions.forEach((definition) => {
      const json = SchemaGenerator.buildSampleJson(definition, true);
      const jsonSchema = SchemaGenerator.process(definition, json);
      expect(jsonSchema.title).toEqual(definition.identifier);
    });
    done();
  });

  it('Should generate Sample Data from all UCA, create the json schema and use AJV to '
    + ' validate both the data and the json schema against each other', async (done) => {
    definitions.forEach((definition) => {
      const json = SchemaGenerator.buildSampleJson(definition, true);
      const jsonSchema = SchemaGenerator.process(definition, json);
      expect(jsonSchema.title).toEqual(definition.identifier);
      const ajv = new Ajv();
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(json);
      expect(isValid).toBeTruthy();
    });
    done();
  });

  it('Should NOT validate with AJV a value lower than minimum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      minimum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 0 });
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should validate with AJV a value equals than minimum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      minimum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 1 });
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should NOT validate with AJV a value equals than exclusiveMinimum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMinimum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 1 });
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should validate with AJV a value higher than exclusiveMinimum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMinimum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 2 });
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should validate with AJV a value lower than maximum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      maximum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 0 });
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should validate with AJV a value equals than maximum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      maximum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 1 });
    expect(isValid).toBeTruthy();
    done();
  });

  it('Should NOT validate with AJV a value higher than maximum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      maximum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 2 });
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should NOT validate with AJV a value equals exclusiveMaximum', async (done) => {
    const definition = {
      identifier: 'cvc:Type:myCustomType',
      version: '1',
      type: 'Number',
      exclusiveMaximum: 1,
    };

    const json = SchemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate({ myCustomType: 1 });
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should change the type of String to Boolean and fail AJV validation', async (done) => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: 'Joao',
      otherNames: 'Paulo',
      familyNames: 'Santos',
    };
    const uca = new Claim(identifier, value);
    const jsonString = JSON.stringify(uca, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const ucaDefinition = definitions.find(ucaDef => ucaDef.identifier === identifier);
    const jsonSchema = SchemaGenerator.process(ucaDefinition, generatedJson);
    expect(jsonSchema.title).toEqual(identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    // tamper the json from the uca and expect AJV to fail the schema validation
    generatedJson.value.givenNames.value = true;
    const isValid = validate(generatedJson);
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should change the type of String to Number and fail AJV validation', async (done) => {
    const identifier = 'claim-cvc:Identity.name-v1';
    const value = {
      givenNames: 'Joao',
      otherNames: 'Paulo',
      familyNames: 'Santos',
    };
    const uca = new Claim(identifier, value);
    const jsonString = JSON.stringify(uca, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const ucaDefinition = definitions.find(ucaDef => ucaDef.identifier === identifier);
    const jsonSchema = SchemaGenerator.process(ucaDefinition, generatedJson);
    expect(jsonSchema.title).toEqual(identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    // tamper the json from the uca and expect AJV to fail the schema validation
    generatedJson.value.givenNames.value = 12.3535;
    const isValid = validate(generatedJson);
    expect(isValid).toBeFalsy();
    done();
  });

  it('Should change the type of Number to Boolean and fail AJV validation', async (done) => {
    const identifier = 'cvc:Type:day';
    const uca = new Claim(identifier, 1);
    const jsonString = JSON.stringify(uca, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const ucaDefinition = definitions.find(ucaDef => ucaDef.identifier === identifier);
    const jsonSchema = SchemaGenerator.process(ucaDefinition, generatedJson);
    expect(jsonSchema.title).toEqual(identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    // tamper the json from the uca and expect AJV to fail the schema validation
    generatedJson.value = '1';
    const isValid = validate(generatedJson);
    expect(isValid).toBeFalsy();
    done();
  });
});
