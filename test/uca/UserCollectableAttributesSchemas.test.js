import SchemaGenerator from '../../src/lib/uca/schemas/generator/SchemaGenerator';
import definitions from '../../src/lib/uca/definitions';

beforeAll(() => {
  definitions.forEach((definition) => {
    if (definition.identifier === 'civ:Identity:name') {
      console.log(definition.identifier);
      const schemaGenerator = new SchemaGenerator(definition);
      const json = schemaGenerator.buildSampleJson();
      console.log(json);
    }
  });
});

describe('UCA Constructions tests', () => {
  test('UCA construction should fails', async (done) => {
    done();
  });
});
