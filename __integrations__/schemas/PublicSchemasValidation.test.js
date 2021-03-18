const Ajv = require('ajv').default;
const fs = require('fs');
const fetch = require('node-fetch');
const { definitions } = require('@identity.com/uca');

const credentialDefinitions = require('../../src/creds/definitions');

const fixturesPath = '__integrations__/fixtures';
// testings is done only on the test bucket,
// since we only release to production on manual CircleCI flow
// check process env for S3 Schema URL or fallback to an fixed one
const s3BucketUrl = process.env.S3_PUBLIC_SCHEMA_URL
  ? process.env.S3_PUBLIC_SCHEMA_URL
  : 'http://dev-schemas.civic.com.s3-website-us-east-1.amazonaws.com';

describe.skip('Public Schemas Integration Test Suite', () => {
  it('Should succeed validation from the from the correct json file in Credential folder', async (done) => {
    // this is a fixed folder
    const jsonFolder = `${fixturesPath}/correct/Credential`;
    const validateSchemaJestStep = async (credentialDefinition) => {
      const jsonFolderVersion = `${credentialDefinition.version}`;
      // the file name is the last part of the identifier
      const jsonFileName = credentialDefinition.identifier.substring(
        credentialDefinition.identifier.lastIndexOf(':') + 1,
      );
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      const response = await fetch(`${s3BucketUrl}/Credential/${jsonFolderVersion}/${jsonFile}`);
      const jsonSchema = await response.json();
      try {
        const ajv = new Ajv({ allErrors: true });
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        return validate(JSON.parse(json));
      } catch (err) {
        return false;
      }
    };
    const promises = [];
    credentialDefinitions.forEach((credentialDefinition) => {
      promises.push(validateSchemaJestStep(credentialDefinition));
    });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeTruthy());
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  it('Should fail validation from the from the incorrect json file in Credential folder', async (done) => {
    // this is a fixed folder
    const jsonFolder = `${fixturesPath}/incorrect/Credential`;
    const validateSchemaJestStep = async (credentialDefinition) => {
      const jsonFolderVersion = `${credentialDefinition.version}`;
      // the file name is the last part of the identifier
      const jsonFileName = credentialDefinition.identifier.substring(
        credentialDefinition.identifier.lastIndexOf(':') + 1,
      );
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      const response = await fetch(`${s3BucketUrl}/Credential/${jsonFolderVersion}/${jsonFile}`);
      const jsonSchema = await response.json();
      try {
        const ajv = new Ajv({ allErrors: true });
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        return validate(JSON.parse(json));
      } catch (err) {
        // this test is supposed to fail, so If we have an unexpected error return true
        return true;
      }
    };
    const promises = [];
    credentialDefinitions.forEach((credentialDefinition) => {
      promises.push(validateSchemaJestStep(credentialDefinition));
    });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeFalsy());
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  it('Should succeed validation from the json file in UCAs folders', async (done) => {
    // iterate all over the credential's definitions
    const validateSchemaJestStep = async (definition) => {
      const jsonFolderVersion = `${definition.version}`;
      const { identifier } = definition;
      const typeFolder = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':'));
      const jsonFolder = `${fixturesPath}/correct/${typeFolder}`;
      // the file name is the last part of the identifier
      const jsonFileName = identifier.substring(identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      const response = await fetch(`${s3BucketUrl}/${typeFolder}/${jsonFolderVersion}/${jsonFile}`);
      const jsonSchema = await response.json();
      try {
        const ajv = new Ajv({ allErrors: true });
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        return validate(JSON.parse(json));
      } catch (err) {
        return false;
      }
    };
    const promises = [];
    definitions.forEach((definition) => { promises.push(validateSchemaJestStep(definition)); });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeTruthy());
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });

  it('Should fail validation from the json file in UCAs folders', async (done) => {
    // iterate all over the credential's definitions
    const validateSchemaJestStep = async (definition) => {
      const jsonFolderVersion = `${definition.version}`;
      const { identifier } = definition;
      const typeFolder = identifier.substring(identifier.indexOf(':') + 1, identifier.lastIndexOf(':'));
      const jsonFolder = `${fixturesPath}/incorrect/${typeFolder}`;
      // the file name is the last part of the identifier
      const jsonFileName = identifier.substring(identifier.lastIndexOf(':') + 1);
      // all fixtures are json
      const jsonFile = `${jsonFileName}.json`;
      // read the generated json
      const json = fs.readFileSync(`${jsonFolder}/${jsonFile}`, 'utf8');
      // fetch from the S3 url bucket, it's a public one
      const response = await fetch(`${s3BucketUrl}/${typeFolder}/${jsonFolderVersion}/${jsonFile}`);
      const jsonSchema = await response.json();
      try {
        const ajv = new Ajv({ allErrors: true });
        // compile ajv with the schema
        const validate = ajv.compile(jsonSchema);
        // validate now the json from the fixture against the json from the S3
        return validate(JSON.parse(json));
      } catch (err) {
        return true;
      }
    };
    const promises = [];
    definitions.forEach((definition) => {
      try {
        promises.push(validateSchemaJestStep(definition));
      } catch (err) {
        done.fail(err);
      }
    });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeFalsy());
      done();
    }).catch((err) => {
      done.fail(err);
    });
  });
});
