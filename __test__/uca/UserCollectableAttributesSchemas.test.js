const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');
const definitions = require('../../src/uca/definitions');
const Ajv = require('ajv');

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

  it('Should generate Sample Data from all UCA, create the json schema and use AJV to validate both the data and the json schema against each other', async (done) => {
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
});
