import fs from 'fs';
import { Validator } from 'jsonschema';

describe('Testing the default entry point index', () => {
  it('Should load schema identity.name.last then validate against a valid json', () => {
    fs.readFile('./src/lib/uca/schemas/identity.name.last.json', 'utf8', (err, data) => {
      if (err) {
        throw new Error('I couldn\'t read the uca/schemas/identity.name.last.json');
      } else {
        const schema = JSON.parse(data);
        const validator = new Validator();
        const sampleJson = {
          'identity.name.last': 'Test',
        };
        const jsonValidation = validator.validate(sampleJson, schema);
        expect(jsonValidation.valid).toBe(true);
      }
    });
  });

  it('Should load schema identity.name.last then validate against a invalid json', () => {
    fs.readFile('./src/lib/uca/schemas/identity.name.last.json', 'utf8', (err, data) => {
      if (err) {
        throw new Error('I couldn\'t read the uca/schemas/identity.name.last.json');
      } else {
        const schema = JSON.parse(data);
        const validator = new Validator();
        // intetionally mispelled last to lsat
        const sampleJson = {
          'identity.name.lsat': 'Last Name',
        };
        const jsonValidation = validator.validate(sampleJson, schema);
        expect(jsonValidation.valid).toBe(false);
      }
    });
  });
});
