import { UCA } from '../../src/lib/uca/UserCollectableAttribute';
import VC from '../../src/lib/creds/VerifiableCredential';
import SchemaGenerator from '../../src/lib/uca/schemas/generator/SchemaGenerator';

jest.mock('../../src/lib/creds/definitions');

// TODO add more tests to validate the integrity of the json schemas
describe('VerifiableCredentials SchemaGenerator validation', () => {
  test('Should validate the VC Schema generation', async (done) => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:Credential:TestWithExcludes', 'jest:test', [name, dob], 1);
    const jsonString = JSON.stringify(cred, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = new SchemaGenerator(null).process('civ:Credential:TestWithExcludes', generatedJson);
    expect(jsonSchema.properties.type.type).toBe('array');
    expect(jsonSchema.properties.version.type).toBe('number');
    expect(jsonSchema.properties.claims.type).toBe('object');
    expect(jsonSchema.properties.signature.type).toBe('object');
    done();
  });
});
