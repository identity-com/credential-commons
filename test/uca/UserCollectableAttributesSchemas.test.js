import SchemaGenerator from '../../src/lib/uca/schemas/generator/schemaGenerator';
import definitions from '../../src/lib/uca/definitions';

describe('UCA Constructions tests', () => {
  test('UCA construction should fails', async (done) => {
    definitions.forEach((definition) => {
      const schema = SchemaGenerator.process(definition.identifier, definition);
      console.log(JSON.stringify(schema));
    });
    done();
  });
});
