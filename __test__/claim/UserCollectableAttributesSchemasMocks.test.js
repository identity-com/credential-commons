jest.mock('../../src/claim/definitions');

const Ajv = require('ajv');
const { Claim } = require('../../src/claim/Claim');
const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');
const ucaMockDefinitions = require('../../src/claim/__mocks__/definitions');

/**
 * Jest is really a painful when it comes to mocking require.
 * I have built this separate file, because to mock require jest.mock has to be called before
 * the require or you have to configure the module mapper on the package.json. That led us to
 * two test classes for the same semantic 'test subject', in this case UserCollectableAttribute Schema generations.
 * If you mock on the other file it will not work, as UserCollectableAttribute constructor really need the
 * definitions in memory.
 */
describe('UserCollectableAttribute Json Sample Date Construction tests', () => {
  it('Testing boolean types on the UserCollectableAttribute', async (done) => {
    const definition = ucaMockDefinitions.find((def) => def.identifier === 'civ:Mock:booleans');
    const json = SchemaGenerator.buildSampleJson(definition, true);
    const sampleUca = new Claim(definition.identifier, json.booleans);
    expect(sampleUca).toBeDefined();
    const jsonSchema = SchemaGenerator.process(definition, json);
    expect(jsonSchema.title).toEqual(definition.identifier);
    const ajv = new Ajv();
    const validate = ajv.compile(jsonSchema);
    const isValid = validate(json);
    expect(isValid).toBeTruthy();

    done();
  });
});
