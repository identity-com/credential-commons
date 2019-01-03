/* eslint-disable no-console */
const ucaDefinitions = require('../src/claim/definitions');
const credentialDefinitions = require('../src/creds/definitions');
const schemaGenerator = require('../src/schemas/generator/SchemaGenerator');
const { Claim: UCA, getBaseIdentifiers } = require('../src/claim/Claim');
const VC = require('../src/creds/VerifiableCredential');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const shell = require('shelljs');
const uuidv4 = require('uuid/v4');

// static variables only for the CLI, not used in any other place
const GENERATION_FOLDER = 'dist/schemas';
// https://stackoverflow.com/questions/9391370/json-schema-file-extension
const SCHEMA_FILE_EXTENSION = '.schema.json';

/**
 * Defined options for the Schema Generator UCA/Credentials or Both
 */
const askOptions = () => {
  const questions = [
    {
      type: 'list',
      name: 'value',
      message: 'Which schema do you want to generate?',
      choices: ['UCA', 'Credentials', 'Both'],
      filter: val => val.toLowerCase(),
    },
  ];
  return inquirer.prompt(questions);
};

/**
 * Generate the JSON from an UCA Identifier than generate it's schema saving it on the file system
 * @returns {Promise<void>}
 */
const generateUcaSchemas = async () => {
  ucaDefinitions.forEach((definition) => {
    const json = schemaGenerator.buildSampleJson(definition);
    console.log(json);
    const jsonSchema = schemaGenerator.process(definition, json);
    console.log(jsonSchema);
    const fileName = definition.identifier.replace(/-v.*$/, '');
    const jsonFolderVersion = `${definition.version}`;
    const folderPath = `${GENERATION_FOLDER}/uca/${jsonFolderVersion}`;
    if (!fs.existsSync(folderPath)) {
      shell.mkdir('-p', folderPath);
    }
    const filePath = `${fileName}${SCHEMA_FILE_EXTENSION}`;
    const fullPath = `${folderPath}/${filePath}`;
    fs.writeFile(fullPath, JSON.stringify(jsonSchema, null, 2), (err) => {
      if (err) throw err;
      console.log(`Json Schema generated on:${fullPath}`);
    });
  });
};

/**
 * Generate an Credential using the definition and it's correlateds UCAs than generate the schema saving it on the file system
 * @returns {Promise<void>}
 */
const generateCredentialSchemas = async () => {
  credentialDefinitions.forEach(async (definition) => {
    const ucaArray = [];
    definition.depends.forEach((ucaDefinitionIdentifier) => {
      const ucaDefinition = ucaDefinitions.find(ucaDef => ucaDef.identifier === ucaDefinitionIdentifier);
      const ucaJson = schemaGenerator.buildSampleJson(ucaDefinition);
      let value = ucaJson;
      if (Object.keys(ucaJson).length === 1) {
        value = Object.values(ucaJson)[0];
      }
      const dependentUca = new UCA(ucaDefinition.identifier, value, ucaDefinition.version);
      ucaArray.push(dependentUca);
    });
    const credential = new VC(definition.identifier, 'jest:test', null, ucaArray);
    await credential.requestAnchor();
    await credential.updateAnchor();
    const jsonString = JSON.stringify(credential, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = schemaGenerator.process(credential, generatedJson);
    const jsonFolderVersion = `${definition.version}`;
    const fileName = definition.identifier.replace(/-v.*$/, '');
    const folderPath = `${GENERATION_FOLDER}/credentials/${jsonFolderVersion}`;
    if (!fs.existsSync(folderPath)) {
      shell.mkdir('-p', folderPath);
    }
    const filePath = `${fileName}${SCHEMA_FILE_EXTENSION}`;
    const fullPath = `${folderPath}/${filePath}`;
    fs.writeFile(fullPath, JSON.stringify(jsonSchema, null, 2), (err) => {
      if (err) throw err;
      console.log(`Json Schema generated on:${fullPath}`);
    });
  });
};

const generateBoth = async () => {
  await generateUcaSchemas();
  await generateCredentialSchemas();
};

const generate = async () => {
  if (!process.env.NODE_ENV) {
    clear();
    console.log(
      chalk.green(
        figlet.textSync('CIVIC', { horizontalLayout: 'full' }),
      ),
    );
    const selectedOption = await askOptions();
    if (selectedOption.value === 'uca') {
      await generateUcaSchemas();
    } else if (selectedOption.value === 'credentials') {
      await generateCredentialSchemas();
    }
  } else {
    await generateBoth();
  }
};

debugger;
generate();

