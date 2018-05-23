import fs from 'fs';
import { Validator } from 'jsonschema';

describe('Testing the default entry point index', () => {
  it('Should load schema identity.name.first then validate against a valid json', () => {
    fs.readFile('./src/lib/uca/schemas/identity.name.first.json', 'utf8', (err, data) => {
      if (err) {
        throw new Error('I couldn\'t read the uca/schemas/identity.name.first.json');
      } else {
        const schemaIdentityNameFirst = JSON.parse(data);
        const validator = new Validator();

        const sampleJson = {
          'identity.name.first': 'Test',
        };
        const jsonValidation = validator.validate(sampleJson, schemaIdentityNameFirst);
        expect(jsonValidation.valid).toBe(true);
      }
    });
  });
});
