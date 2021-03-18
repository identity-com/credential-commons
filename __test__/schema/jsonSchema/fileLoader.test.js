const Ajv = require('ajv').default;
const addFormats = require('ajv-formats').default;
const fileLoader = require('../../../src/schema/jsonSchema/fileLoader');
const { initialize } = require('../../../src');

let ajv;

describe('fileLoader', () => {
  beforeAll(initialize);

  beforeEach(() => {
    ajv = new Ajv({
      logger: console,
      allErrors: true,
      verbose: true,
      loadSchema: fileLoader.loadSchema,
    });

    ajv.addKeyword('attestable');

    // add data formats such as date-time
    addFormats(ajv);
  });

  it('should load a schema by URI', async () => {
    const validate = await ajv.compileAsync({
      $ref: 'http://identity.com/schemas/claim-cvc:Contact.email-v1',
    });

    const valid = validate({
      username: 'test',
      domain: {
        name: 'test',
        tld: 'test',
      },
    });

    expect(valid).toBeTruthy();
  });

  it('should throw an error if a schema is missing', async () => {
    const shouldFail = ajv.compileAsync({
      $ref: 'http://identity.com/schemas/claim-cvc:unknown-v1',
    });

    return expect(shouldFail).rejects.toThrow(/Cannot find module/);
  });

  it('should load all credentials', async () => {
    const allLoaded = await fileLoader.loadAll(ajv);

    expect(allLoaded.length).toBeGreaterThan(10);
  });
});
