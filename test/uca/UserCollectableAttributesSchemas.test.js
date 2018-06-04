const SchemaGenerator = require('../../src/lib/uca/schemas/generator/SchemaGenerator');
const definitions = require('../../src/lib/uca/definitions');

describe('UCA Json Sample Date Construction tests', () => {
  test('UCA JSON Sample Data from all coded identifiers has to succeed', async (done) => {
    definitions.forEach((definition) => {
      const schemaGenerator = new SchemaGenerator(definition);
      const json = schemaGenerator.buildSampleJson();
      expect(typeof json).toEqual('object');
    });
    done();
  });

  test('Generate Sample Data from all UCA and then create the json schema', async (done) => {
    definitions.forEach((definition) => {
      const schemaGenerator = new SchemaGenerator(definition);
      const json = schemaGenerator.buildSampleJson();
      const jsonSchema = schemaGenerator.process(definition.identifier, json);
      expect(jsonSchema.title).toEqual(definition.identifier);
    });
    done();
  });
});
