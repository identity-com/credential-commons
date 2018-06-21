/* eslint-disable no-console */
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require('inquirer');
const fs = require('fs');
const shell = require('shelljs');
const homedir = require('os').homedir();


/**
 * Defined options for the Schema Generator UCA/Credentials or Both
 */
const askOptions = () => {
  const questions = [
    {
      type: 'input',
      name: 'CIVIC_SEC_URL',
      message: 'CIVIC_SEC_URL',
    },
    {
      type: 'input',
      name: 'CIVIC_ATTN_URL',
      message: 'CIVIC_ATTN_URL',
    },
    {
      type: 'input',
      name: 'CIVIC_CLIENT_ID',
      message: 'CIVIC_CLIENT_ID',
    },
    {
      type: 'input',
      name: 'CIVIC_CLIENT_XPUB',
      message: 'CIVIC_CLIENT_XPUB',
    },
    {
      type: 'input',
      name: 'CIVIC_CLIENT_XPRV',
      message: 'CIVIC_CLIENT_XPRV',
    },
    {
      type: 'input',
      name: 'CIVIC_PASSPHRASE',
      message: 'CIVIC_PASSPHRASE',
    },
    {
      type: 'input',
      name: 'CIVIC_KEYCHAIN',
      message: 'CIVIC_KEYCHAIN',
    },
  ];
  return inquirer.prompt(questions);
};

/**
 * Generate the JSON from an UCA Identifier than generate it's schema saving it on the file system
 * @returns {Promise<void>}
 */
const generateCivicEnvCredentials = async (values) => {
  let envCivicFileContent = '';
  const keys = Object.keys(values);
  keys.forEach((key) => {
    envCivicFileContent += `${key}=${values[key]}\n`;
  });
  const path = `${homedir}/.civic/`;
  if (!fs.exists(path)) {
    shell.mkdir('-p', path);
  }
  fs.writeFile(`${path}config`, envCivicFileContent, (err) => {
    if (err) throw err;
    console.log('Civic credentials file successfully created');
  });
};

const generate = async () => {
  clear();
  console.log(
    chalk.green(
      figlet.textSync('CIVIC', { horizontalLayout: 'full' }),
    ),
  );

  const selectedOption = await askOptions();
  await generateCivicEnvCredentials(selectedOption);
};

generate();

