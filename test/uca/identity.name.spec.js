import fs from 'fs';
import Ajv from 'ajv';

// ajv ValidateFunction
let validate;

beforeAll(async () => {
  // TODO sync code or chain promises
  const jsonIdentityNameFirst = fs.readFileSync('./src/lib/uca/schemas/identity.name.first.json', 'utf8');
  const jsonIdentityNameMiddle = fs.readFileSync('./src/lib/uca/schemas/identity.name.middle.json', 'utf8');
  const jsonIdentityNameLast = fs.readFileSync('./src/lib/uca/schemas/identity.name.last.json', 'utf8');
  const jsonIdentityName = fs.readFileSync('./src/lib/uca/schemas/identity.name.json', 'utf8');
  // parse the json file
  const schemaIdentityNameFirst = JSON.parse(jsonIdentityNameFirst);
  const schemaIdentityNameMiddle = JSON.parse(jsonIdentityNameMiddle);
  const schemaIdentityNameLast = JSON.parse(jsonIdentityNameLast);
  const schemaIdentityName = JSON.parse(jsonIdentityName);
  // create a new json schema validator
  const validator = new Ajv({
    allErrors: true,
    schemas: [schemaIdentityName, schemaIdentityNameFirst, schemaIdentityNameMiddle, schemaIdentityNameLast],
  });
  validate = await validator.getSchema('http://civic.com/uca/schemas/identity.name.json');
});
/**
 * Lots of things to validate later with the team
 * TODO required and anyOf properties in this sample {} is valid
 * TODO additionalProperties if you don't put this to false, any misspelled word is a valid property
 */
describe('Testing the schema identity.name.json', () => {
  it('Should validate the type of the property first', async () => {
    // invalid json, since the type o first, should be String
    const sampleJson = {
      first: 2,
    };
    const validation = await validate(sampleJson);
    // it has to succeed, or else we have a problem
    expect(validation).toBe(false);
  });

  it('Should validate the type of the property middle', async () => {
    // invalid json, since the type o first, should be String
    const sampleJson = {
      middle: 2,
    };
    const validation = await validate(sampleJson);
    // it has to succeed, or else we have a problem
    expect(validation).toBe(false);
  });

  it('Should validate the type of the property last', async () => {
    // invalid json, since the type o first, should be String
    const sampleJson = {
      last: 2,
    };
    const validation = await validate(sampleJson);
    // it has to succeed, or else we have a problem
    expect(validation).toBe(false);
  });

  it('Should validate a valid json with all three properties', async () => {
    // invalid json, since the type o first, should be String
    const sampleJson = {
      first: 2,
      middle: 2,
      last: 2,
    };
    const validation = await validate(sampleJson);
    // it has to succeed, or else we have a problem
    expect(validation).toBe(false);
  });

  it('Should load schema identity.name then validate against a empty json', async () => {
    // TODO an empty JSON is valid?, looking at the schema, there is no required property or anyOf tags
    const sampleJson = {
    };
    const validation = await validate(sampleJson);
    // it has to succeed, or else we have a problem
    expect(validation).toBe(true);
  });
});
