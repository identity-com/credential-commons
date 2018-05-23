import fs from 'fs';
import { Validator } from 'jsonschema';

describe('Testing the default entry point index', () => {
  it('Should load schema identity.name.middle then validate against a valid json', () => {
    // async reading of file
    fs.readFile('./src/lib/uca/schemas/identity.name.middle.json', 'utf8', (err, data) => {
      if (err) {
        // cant read the json locally? we have a huge problem
        throw new Error('I couldn\'t read the uca/schemas/identity.name.middle.json');
      } else {
        // parse the json file
        const schema = JSON.parse(data);
        // create a new json schema validator
        const validator = new Validator();
        // sample valid JSON
        const sampleJson = {
          'identity.name.middle': 'Test',
        };
        const jsonValidation = validator.validate(sampleJson, schema);
        // it has to succeed, or else we have a problem
        expect(jsonValidation.valid).toBe(true);
      }
    });
  });

  it('Should load schema identity.name.first then validate against a invalid json', () => {
    fs.readFile('./src/lib/uca/schemas/identity.name.middle.json', 'utf8', (err, data) => {
      if (err) {
        throw new Error('I couldn\'t read the uca/schemas/identity.name.middle.json');
      } else {
        const schema = JSON.parse(data);
        const validator = new Validator();
        // intetionally mispelled middle to midle
        const sampleJson = {
          'identity.name.midle': 'Test',
        };
        const jsonValidation = validator.validate(sampleJson, schema);
        expect(jsonValidation.valid).toBe(false);
      }
    });
  });
});
