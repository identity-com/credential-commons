import fs from 'fs';
import Ajv from 'ajv';

// ajv ValidateFunction
let validate;
// should read the schemas only once
beforeAll(async () => {
  // TODO sync code or chain promises
  const jsonIdentityNameFirst = fs.readFileSync('./src/lib/uca/schemas/identity.name.first.json', 'utf8');
  // parse the json file
  const schemaIdentityNameFirst = JSON.parse(jsonIdentityNameFirst);
  // create a new json schema validator
  const validator = new Ajv({
    allErrors: true,
    schemas: [schemaIdentityNameFirst],
  });
  validate = await validator.getSchema('http://civic.com/uca/schemas/identity.name.first.json');
});

describe('Testing the default entry point index', () => {
  it('Should validate against a valid json', async () => {
    const sampleJson = {
      'identity.name.first': '2',
    };
    const validation = await validate(sampleJson);
    // it has to succeed, since the required and the type are valid
    expect(validation).toBe(false);
  });

  it('Should load schema identity.name.first then validate against a invalid json', async () => {
    // invalid json, since the type of first, should be String
    const sampleJson = {
      'identity.name.frst': '2',
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
