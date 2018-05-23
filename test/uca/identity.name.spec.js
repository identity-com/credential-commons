import fs from 'fs';
import { Validator } from 'jsonschema';
import Promise from 'bluebird';

describe('Testing the default entry point index', () => {
  it('Should load schema identity.name then validate against a valid json', async () => {
    const readFileAsync = Promise.promisify(fs.readFile);
    const jsonIdentityNameFirst = await readFileAsync('./src/lib/uca/schemas/identity.name.first.json', 'utf8');
    const jsonIdentityNameMiddle = await readFileAsync('./src/lib/uca/schemas/identity.name.middle.json', 'utf8');
    const jsonIdentityNameLast = await readFileAsync('./src/lib/uca/schemas/identity.name.last.json', 'utf8');
    const jsonIdentityName = await readFileAsync('./src/lib/uca/schemas/identity.name.last.json', 'utf8');

    // parse the json file
    const schemaIdentityNameFirst = JSON.parse(jsonIdentityNameFirst);
    const schemaIdentityNameMiddle = JSON.parse(jsonIdentityNameMiddle);
    const schemaIdentityNameLast = JSON.parse(jsonIdentityNameLast);
    const schemaIdentityName = JSON.parse(jsonIdentityName);
    // create a new json schema validator
    const validator = new Validator();
    // sample valid JSON
    const sampleJson = {
      'identity.name.first': 'First ',
      'identity.name.middle': 'Middle ',
      'identity.name.last': 'Last ',
    };
    validator.addSchema(schemaIdentityNameFirst, 'http://civic.com/uca/schemas/identity.name.first.json');
    validator.addSchema(schemaIdentityNameMiddle, 'http://civic.com/uca/schemas/identity.name.middle.json');
    validator.addSchema(schemaIdentityNameLast, 'http://civic.com/uca/schemas/identity.name.last.json');
    const jsonValidation = validator.validate(sampleJson, schemaIdentityName);

    // it has to succeed, or else we have a problem
    expect(jsonValidation.valid).toBe(true);
  });
});
