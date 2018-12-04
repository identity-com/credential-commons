const Ajv = require('ajv');
const { Claim: UCA, definitions } = require('../../src/claim/Claim');
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
      const json = SchemaGenerator.buildSampleJson(definition);
      const jsonSchema = SchemaGenerator.process(definition, json);
      expect(jsonSchema.title).toEqual(definition.identifier);
    });
    done();
  });

  it('Should generate Sample Data from all UCA, create the json schema and use AJV to '
    + ' validate both the data and the json schema against each other', async (done) => {
    definitions.forEach((definition) => {
      const json = SchemaGenerator.buildSampleJson(definition);
      const jsonSchema = SchemaGenerator.process(definition, json);
      expect(jsonSchema.title).toEqual(definition.identifier);
      const ajv = new Ajv();
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(json);
      expect(isValid).toBeTruthy();
    });
    done();
  });

  it('Should change the type of String to Boolean and fail AJV validation', async (done) => {
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'Joao',
      otherNames: 'Paulo',
      familyNames: 'Santos',
    };
    const uca = new UCA(identifier, value);
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
    const identifier = 'cvc:Identity:name';
    const value = {
      givenNames: 'Joao',
      otherNames: 'Paulo',
      familyNames: 'Santos',
    };
    const uca = new UCA(identifier, value);
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
    const uca = new UCA(identifier, 1);
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
