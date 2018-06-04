import { UCA } from '../../src/lib/uca/UserCollectableAttribute';
import VC from '../../src/lib/creds/VerifiableCredential';
import SchemaGenerator from '../../src/lib/uca/schemas/generator/SchemaGenerator';
import credentialDefinitions from '../../src/lib/creds/definitions';
import ucaDefinitions from '../../src/lib/uca/definitions';

const fs = require('fs');

beforeAll(() => {
  credentialDefinitions.forEach((credentialDefinition) => {
    const ucaArray = [];
    credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
      const ucaDefinition = ucaDefinitions.find(ucaDef => ucaDef.identifier === ucaDefinitionIdentifier);
      const schemaGenerator = new SchemaGenerator(ucaDefinition);
      const ucaJson = schemaGenerator.buildSampleJson();
      // TODO compound UCA error
      const dependentUca = new UCA(ucaDefinition.identifier, ucaJson, ucaDefinition.version);
      ucaArray.push(dependentUca);
    });
    const credential = new VC(credentialDefinition.identifier, 'jest:test', ucaArray, 1);
    const jsonString = JSON.stringify(credential, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = new SchemaGenerator(null).process('civ:Credential:Identity', generatedJson);
    const schemaName = jsonSchema.title.replace(/:/g, '.');
    const filePath = `src/lib/creds/schemas/${schemaName}.json`;

    fs.writeFile(filePath, JSON.stringify(jsonSchema, null, 2), (err) => {
      if (err) throw err;
    });
  });
});

// TODO add more tests to validate the integrity of the json schemas
describe('VerifiableCredentials SchemaGenerator validation', () => {
  test('Should validate the VC Schema generation against a single well known definition', async (done) => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:Identity', 'jest:test', [name, dob], 1);
    const jsonString = JSON.stringify(cred, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = new SchemaGenerator(null).process('civ:Credential:Identity', generatedJson);
    expect(jsonSchema.properties.type.type).toBe('array');
    expect(jsonSchema.properties.version.type).toBe('number');
    expect(jsonSchema.properties.claims.type).toBe('object');
    expect(jsonSchema.properties.signature.type).toBe('object');
    done();
  });
});
