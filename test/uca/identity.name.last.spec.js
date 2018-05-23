import fs from 'fs';
import Ajv from 'ajv';

// ajv ValidateFunction
let validate;
// should read the schemas only once
beforeAll(async () => {
  // TODO sync code or chain promises
  const jsonIdentityNameFirst = fs.readFileSync('./src/lib/uca/schemas/identity.name.last.json', 'utf8');
  // parse the json file
  const schemaIdentityNameFirst = JSON.parse(jsonIdentityNameFirst);
  // create a new json schema validator
  const validator = new Ajv({
    allErrors: true,
    schemas: [schemaIdentityNameFirst],
  });
  validate = await validator.getSchema('http://civic.com/uca/schemas/identity.name.last.json');
});

describe('Testing the default entry point index', () => {
  it('Should validate against a valid json', async () => {
    const sampleJson = {
      'identity.name.last': '2',
    };
    const validation = await validate(sampleJson);
    // it has to succeed, since the required and the type are valid
    expect(validation).toBe(false);
  });

  it('Should load schema identity.name.last then validate against a invalid json', async () => {
    // invalid json, since the type of last, should be String
    const sampleJson = {
      'identity.name.lst': '2',
    };
    const validation = await validate(sampleJson);
    // since it has an required property, the validation has to be false
    expect(validation).toBe(false);
  });

  it('Should validate against a empty json', async () => {
    const sampleJson = {
    };
    const validation = await validate(sampleJson);
    // since it has an required property, the validation has to be false
    expect(validation).toBe(false);
  });
});
