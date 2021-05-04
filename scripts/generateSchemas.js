/* eslint-disable no-console */
const claimDefinitions = require('../src/claim/definitions');
const credentialDefinitions = require('../src/creds/definitions');
const schemaGenerator = require('../src/schemas/generator/SchemaGenerator');
const {Claim, getBaseIdentifiers} = require('../src/claim/Claim');
const {UserCollectableAttribute: UCA, definitions: ucaDefinitions} = require('@identity.com/uca');
const VC = require('../src/creds/VerifiableCredential');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const shell = require('shelljs');

// static variables only for the CLI, not used in any other place
const GENERATION_FOLDER = 'dist/schemas';
// https://stackoverflow.com/questions/9391370/json-schema-file-extension
const SCHEMA_FILE_EXTENSION = '.schema.json';

/**
 * Defined options for the Schema Generator Claim/Credentials or Both
 */
const askOptions = () => {
    const questions = [
        {
            type: 'list',
            name: 'value',
            message: 'Which schema do you want to generate?',
            choices: ['UCAs and Claims', 'Credentials', 'Both'],
            filter: val => val.toLowerCase(),
        },
    ];
    return inquirer.prompt(questions);
};

/**
 * Generate the JSON from an Claim Identifier than generate it's schema saving it on the file system
 * @returns {Promise<void>}
 */
const generateUcaSchemas = async () => {
    claimDefinitions.forEach((definition) => {
        // if (definition.credentialItem) {
        generateSchemaForDefinition(definition, definition.identifier.replace(/-v.*$/, ''), 'claim');
        // }
    });

    ucaDefinitions.forEach((definition) => {
        generateSchemaForDefinition(definition, `uca-${definition.identifier}`, 'uca');
    });
};

const generateSchemaForDefinition = (definition, fileName, typeOfDefinition) => {
    const json = schemaGenerator.buildSampleJson(definition, true);
    const jsonSchema = schemaGenerator.process(definition, json);
    const jsonFolderVersion = `${definition.version ? definition.version : "1"}`;
    const folderPath = `${GENERATION_FOLDER}/${typeOfDefinition}/${jsonFolderVersion}`;
    if (!fs.existsSync(folderPath)) {
        shell.mkdir('-p', folderPath);
    }
    const filePath = `${fileName}${SCHEMA_FILE_EXTENSION}`;
    const fullPath = `${folderPath}/${filePath}`;
    fs.writeFile(fullPath, JSON.stringify(jsonSchema, null, 2), (err) => {
        if (err) throw err;
        console.log(`Json Schema generated on:${fullPath}`);
    });
}

/**
 * Generate an Credential using the definition and it's correlateds Claims than generate the schema saving it on the file system
 * @returns {Promise<void>}
 */
const generateCredentialSchemas = async () => {
    credentialDefinitions.forEach(async (definition) => {
        const properties = {};
        definition.depends.forEach(function (depends) {
            let nameParts = depends.match(/^(claim-)?cvc:([^.:]+)[:.]([^-]+)/);

            if(nameParts === null) {
                console.log(depends);
            }

            let parentName = nameParts[2].toLowerCase();
            if(!properties[parentName]) {
                properties[parentName] = {
                    type: "object",
                    properties : {},
                    additionalProperties: false
                }
            }

            properties[parentName].properties[nameParts[3]] = {
                "$ref": 'http://identity.com/schemas/' + depends
            }
        });


        let schema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$id": "http://identity.com/schemas/" + definition.identifier,
            "title": definition.identifier,
            "type": "object",
            "allOf": [
                {
                    "$ref": "http://identity.com/schemas/type-meta:Credential-v1#/definitions/credential"
                },
                {
                    "properties": {
                        "claim": {
                            "type": "object",
                            "properties": properties,
                            additionalProperties: false
                        }
                    }
                }
            ]
        }

        const jsonFolderVersion = `${definition.version}`;
        const fileName = definition.identifier.replace(/-v.*$/, '');
        const folderPath = `${GENERATION_FOLDER}/credential/${jsonFolderVersion}`;

        if (!fs.existsSync(folderPath)) {
            shell.mkdir('-p', folderPath);
        }
        const filePath = `${fileName}${SCHEMA_FILE_EXTENSION}`;
        const fullPath = `${folderPath}/${filePath}`;
        fs.writeFile(fullPath, JSON.stringify(schema, null, 2), (err) => {
            if (err) throw err;
            console.log(`Json Schema generated on:${fullPath}`);
        });
    });

    return;
    credentialDefinitions.forEach(async (definition) => {
        const ucaArray = [];
        const jsonValueDefinitions = {};

        definition.depends.forEach((ucaDefinitionIdentifier) => {
            const ucaDefinition = claimDefinitions.find(ucaDef => ucaDef.identifier === ucaDefinitionIdentifier);
            const ucaJson = schemaGenerator.buildSampleJson(ucaDefinition, true);
            const copyUcaWithDefinitions = JSON.parse(JSON.stringify(ucaJson));
            const {identifierComponents} = getBaseIdentifiers(ucaDefinitionIdentifier);
            delete ucaJson.definition;

            Object.keys(ucaJson).forEach((prop) => {
                delete ucaJson[prop].definition;
            });

            let value = ucaJson;
            if (Object.keys(ucaJson).length === 1) {
                value = Object.values(ucaJson)[0];
            }
            jsonValueDefinitions[identifierComponents[2]] = copyUcaWithDefinitions;
            const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
            ucaArray.push(dependentUca);
        });
        const credential = new VC(definition.identifier, 'jest:test', null, ucaArray);

        definition.depends.forEach((ucaDefinitionIdentifier) => {
            const {identifierComponents} = getBaseIdentifiers(ucaDefinitionIdentifier);

            credential.claim[identifierComponents[1].toLowerCase()][identifierComponents[2]] = jsonValueDefinitions[identifierComponents[2]];
        });

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
                figlet.textSync('CIVIC', {horizontalLayout: 'full'}),
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
    } else {
        await generateBoth();
    }
};

generate();

