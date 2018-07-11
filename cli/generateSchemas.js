/* eslint-disable no-console */
const ucaDefinitions = require('../src/uca/definitions');
const credentialDefinitions = require('../src/creds/definitions');
const schemaGenerator = require('../src/schemas/generator/SchemaGenerator');
const UCA = require('../src/uca/UserCollectableAttribute');
const VC = require('../src/creds/VerifiableCredential');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');

// static variables only for the CLI, not used in any other place
const GENERATION_FOLDER = 'dist/schemas/';
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
    const jsonSchema = schemaGenerator.process(definition, json);
    const fileName = definition.identifier.substring(definition.identifier.lastIndexOf(':') + 1);
    const filePath = `${GENERATION_FOLDER}/uca/${fileName}${SCHEMA_FILE_EXTENSION}`;
    fs.writeFile(filePath, JSON.stringify(jsonSchema, null, 2), (err) => {
      if (err) throw err;
      console.log(`Json Schema generated on:${GENERATION_FOLDER}${fileName}${SCHEMA_FILE_EXTENSION}`);
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
    const credential = new VC(definition.identifier, 'jest:test', null, ucaArray, 1);
    await credential.requestAnchor();
    await credential.updateAnchor();
    const jsonString = JSON.stringify(credential, null, 2);
    const generatedJson = JSON.parse(jsonString);
    const jsonSchema = schemaGenerator.process(credential, generatedJson);
    const fileName = definition.identifier.substring(definition.identifier.lastIndexOf(':') + 1);
    const filePath = `${GENERATION_FOLDER}/credentials/${fileName}${SCHEMA_FILE_EXTENSION}`;
    console.log(filePath);
    fs.writeFile(filePath, JSON.stringify(jsonSchema, null, 2), (err) => {
      if (err) throw err;
      console.log(`Json Schema generated on:${GENERATION_FOLDER}${fileName}${SCHEMA_FILE_EXTENSION}`);
    });
  });
};

const generateBoth = async () => {
  await generateUcaSchemas();
  await generateCredentialSchemas();
};

const generate = async () => {
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
  } else {
    await generateBoth();
  }
};

generate();

