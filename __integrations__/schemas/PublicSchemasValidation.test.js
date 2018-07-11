const credentialDefinitions = require('../../src/creds/definitions');
const ucaDefinitions = require('../../src/uca/definitions');
const Ajv = require('ajv');
const fs = require('fs');
const fetch = require('node-fetch');

const fixturesPath = '__integrations__/fixtures';
// testings is done only on the test bucket, since we only release to production on manual CircleCI flow
const s3BucketUrl = 'https://s3.amazonaws.com/dev-schemas.civic.com';

describe('Public Schemas Integration Test Suite', () => {
  it('Should succeed validation from the from the correct json file in Credential folder', async (done) => {
    // this is a fixed folder
    const jsonFolder = `${fixturesPath}/correct/Credential`;
    // iterate all over the credential's definitions
    credentialDefinitions.forEach(async (credentialDefinition) => {
      const jsonFolderVersion = `v${credentialDefinition.version}`;
      // the file name is the last part of the identifier
      const jsonFileName = credentialDefinition.identifier.substring(credentialDefinition.identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      fetch(`${s3BucketUrl}/Credential/${jsonFolderVersion}/${jsonFile}`).then((res => res.json())).then((jsonSchema) => {
        const ajv = new Ajv();
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        const isValid = validate(JSON.parse(json));
        // it has to succeed, if not the published schemas has an problem
        expect(isValid).toBeTruthy();
        done();
      });
    });
  });

  it('Should fail validation from the from the incorrect json file in Credential folder', async (done) => {
    // this is a fixed folder
    const jsonFolder = `${fixturesPath}/incorrect/Credential`;
    // iterate all over the credential's definitions
    credentialDefinitions.forEach(async (credentialDefinition) => {
      const jsonFolderVersion = `v${credentialDefinition.version}`;
      // the file name is the last part of the identifier
      const jsonFileName = credentialDefinition.identifier.substring(credentialDefinition.identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      fetch(`${s3BucketUrl}/Credential/${jsonFolderVersion}/${jsonFile}`).then((res => res.json())).then((jsonSchema) => {
        const ajv = new Ajv();
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        const isValid = validate(JSON.parse(json));
        // it has to fail, all the json on this folder has one property that has an different type from the schema
        expect(isValid).toBeFalsy();
        done();
      });
    });
  });

  it('Should succeed validation from the json file in UCAs folders', async (done) => {
    // iterate all over the credential's definitions
    ucaDefinitions.forEach((definition) => {
      const jsonFolderVersion = `v${definition.version}`;
      const identifier = definition.identifier;
      const typeFolder = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':'));
      const jsonFolder = `${fixturesPath}/correct/${typeFolder}`;
      // the file name is the last part of the identifier
      const jsonFileName = identifier.substring(identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      fetch(`${s3BucketUrl}/${typeFolder}/${jsonFolderVersion}/${jsonFile}`).then((res => res.json())).then((jsonSchema) => {
        const ajv = new Ajv();
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        const isValid = validate(JSON.parse(json));
        // it has to succeed, if not the published schemas has an problem
        expect(isValid).toBeTruthy();
        done();
      });
    });
  });

  it('Should fail validation from the json file in UCAs folders', async (done) => {
    // iterate all over the credential's definitions
    ucaDefinitions.forEach((definition) => {
      const jsonFolderVersion = `v${definition.version}`;
      const identifier = definition.identifier;
      const typeFolder = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':'));
      const jsonFolder = `${fixturesPath}/incorrect/${typeFolder}`;
      // the file name is the last part of the identifier
      const jsonFileName = identifier.substring(identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      fetch(`${s3BucketUrl}/${typeFolder}/${jsonFolderVersion}/${jsonFile}`).then((res => res.json())).then((jsonSchema) => {
        const ajv = new Ajv();
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        const isValid = validate(JSON.parse(json));
        // it has to succeed, if not the published schemas has an problem
        expect(isValid).toBeFalsy();
        done();
      });
    });
  });
});
