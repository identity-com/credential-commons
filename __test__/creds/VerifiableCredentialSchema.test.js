const UCA = require('../../src/uca/UserCollectableAttribute');
const VC = require('../../src/creds/VerifiableCredential');
const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');
const credentialDefinitions = require('../../src/creds/definitions');
const ucaDefinitions = require('../../src/uca/definitions');

const Ajv = require('ajv');

// TODO add more tests to validate the integrity of the json schemas
describe('VerifiableCredentials SchemaGenerator validation', () => {
  it('Should validate the VC Schema generation against a single well known definition', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 1, year: 1978 });
    const cred = new VC('civ:Credential:CivicBasic', 'jest:test', null, [name, dob], 1);
    const jsonString = JSON.stringify(cred, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = SchemaGenerator.process(cred, generatedJson);
    expect(jsonSchema.properties.type.type).toBe('array');
    expect(jsonSchema.properties.version.type).toBe('number');
    expect(jsonSchema.properties.claims.type).toBe('object');
    expect(jsonSchema.properties.signature.type).toBe('object');
  });

  it('Should validate the generated VC against it\'s generated schema', () => {
    credentialDefinitions.forEach((credentialDefinition) => {
      const ucaArray = [];
      credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
        const ucaDefinition = ucaDefinitions.find(ucaDef => ucaDef.identifier === ucaDefinitionIdentifier);
        const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
        let value = ucaJson;
        if (Object.keys(ucaJson).length === 1) {
          value = Object.values(ucaJson)[0];
        }
        const dependentUca = new UCA(ucaDefinition.identifier, value, ucaDefinition.version);
        ucaArray.push(dependentUca);
      });
      const credential = new VC(credentialDefinition.identifier, 'jest:test', null, ucaArray, 1);
      const jsonString = JSON.stringify(credential, null, 2);
      const generatedJson = JSON.parse(jsonString);
      const jsonSchema = SchemaGenerator.process(credential, generatedJson);
      const ajv = new Ajv();
      const validate = ajv.compile(jsonSchema);
      const isValid = validate(generatedJson);
      console.log(jsonSchema);
      expect(isValid).toBeTruthy();
    });
  });
});
