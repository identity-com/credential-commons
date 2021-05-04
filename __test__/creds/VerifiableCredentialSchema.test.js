const Ajv = require('ajv').default;

const uuidv1 = require('uuid/v1');
const { Claim, definitions } = require('../../src/claim/Claim');
const VC = require('../../src/creds/VerifiableCredential');
const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');
const credentialDefinitions = require('../../src/creds/definitions');

jest.setTimeout(1500000);

/**
 * Also check the integration tests, they add a new layer of testing on the published schemas
 */
describe('VerifiableCredentials SchemaGenerator validation', () => {
  // TODO: Check, this is skipped as it won't be used in future ?
  it.skip('Should validate the VC Schema generation against a single well known definition', () => {
    const name = new Claim('claim-cvc:Identity.name-v1',
      { givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 1, year: 1978 });
    const cred = new VC('credential-cvc:Identity-v1', 'jest:test-v1', null, [name, dob], 1);
    const jsonString = JSON.stringify(cred, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = SchemaGenerator.process(cred, generatedJson);
    expect(jsonSchema.properties.type.type).toBe('array');
    expect(jsonSchema.properties.version.type).toBe('string');
    expect(jsonSchema.properties.claim.type).toBe('object');
    expect(jsonSchema.properties.proof.type).toBe('object');
  });
  // TODO: Check, this is skipped as it won't be used in future ?
  test.skip('Should validate the generated VC against it\'s generated schema looping the definitions', async (done) => {
    const validateSchemaJestStep = async (credentialDefinition) => {
      const ucaArray = [];
      credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
        const ucaDefinition = definitions.find(ucaDef => (
          ucaDef.identifier === ucaDefinitionIdentifier
        ));
        const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
        let value = ucaJson;
        if (Object.keys(ucaJson).length === 1 && ucaDefinition.type !== 'Array') {
          [value] = Object.values(ucaJson);
        }
        const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
        ucaArray.push(dependentUca);
      });
      const credential = new VC(credentialDefinition.identifier, `jest:test:${uuidv1()}`, null, ucaArray, 1);

      await credential.requestAnchor();
      await credential.updateAnchor();
      const jsonString = JSON.stringify(credential, null, 2);
      const generatedJson = JSON.parse(jsonString);
      const jsonSchema = SchemaGenerator.process(credential, generatedJson);
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(generatedJson);
      return isValid;
    };
    const promises = [];
    credentialDefinitions.forEach((credentialDefinition) => {
      promises.push(validateSchemaJestStep(credentialDefinition));
    });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeTruthy());
      done();
    });
  });

  // TODO: Double check if this should be failing against new schema loader
  it.skip('Should change the VC Json data and fail against AJV', () => {
    const identifier = 'credential-cvc:Identity-v1';
    const credentialDefinition = credentialDefinitions.find(credsDef => (
      credsDef.identifier === identifier
    ));
    const ucaArray = [];
    credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
      const ucaDefinition = definitions.find(ucaDef => (
        ucaDef.identifier === ucaDefinitionIdentifier
      ));
      const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
      let value = ucaJson;
      if (Object.keys(ucaJson).length === 1) {
        [value] = Object.values(ucaJson);
      }
      const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
      ucaArray.push(dependentUca);
    });
    const issuer = `jest:test:${uuidv1()}`;
    const credential = new VC(credentialDefinition.identifier, issuer, null, ucaArray, 1);
    const jsonString = JSON.stringify(credential, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = SchemaGenerator.process(credential, generatedJson);
    generatedJson.claim.identity.name.familyNames = 123456;
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(generatedJson);
    expect(isValid).toBeFalsy();
  });
  // TODO: Double check if this should be failing against new schema loader
  it.skip('Should add an property to the root of the json and fail against AJV additionalProperties', () => {
    const identifier = 'credential-cvc:Identity-v1';
    const credentialDefinition = credentialDefinitions.find(credsDef => (
      credsDef.identifier === identifier
    ));
    const ucaArray = [];
    credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
      const ucaDefinition = definitions.find(ucaDef => (
        ucaDef.identifier === ucaDefinitionIdentifier
      ));
      const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
      let value = ucaJson;
      if (Object.keys(ucaJson).length === 1) {
        [value] = Object.values(ucaJson);
      }
      const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
      ucaArray.push(dependentUca);
    });
    const credential = new VC(credentialDefinition.identifier, `jest:test:${uuidv1()}`, null, ucaArray, 1);
    const jsonString = JSON.stringify(credential, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = SchemaGenerator.process(credential, generatedJson);
    generatedJson.anAdditionalPropertyToFail = 'test';
    const ajv = new Ajv({ allErrors: true });
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(generatedJson);
    expect(isValid).toBeFalsy();
  });
});
