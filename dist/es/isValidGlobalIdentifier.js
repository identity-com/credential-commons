const _ = require('lodash');
const ucaDefinitions = require('./uca/definitions');
const vcDefinitions = require('./creds/definitions');

const validUCAIdentifiers = _.map(ucaDefinitions, d => d.identifier);
const validVCIdentifiers = _.map(vcDefinitions, d => d.identifier);
const validPrefixes = ['claim', 'credential'];

function isValidGlobalIdentifier(identifier) {
  const splited = _.split(identifier, '-');

  if (splited.length !== 3) {
    throw new Error('Malformed Global Identifier');
  }

  if (!_.includes(validPrefixes, splited[0])) {
    throw new Error('Invalid Global Identifier Prefix');
  }

  switch (splited[0]) {
    case 'claim':
      if (!_.includes(validUCAIdentifiers, splited[1])) {
        throw new Error(`${identifier} is not valid`);
      }
      return true;
    case 'credential':
      if (!_.includes(validVCIdentifiers, splited[1])) {
        throw new Error(`${identifier} is not valid`);
      }
      return true;
    default:
      return false;
  }
}

module.exports = isValidGlobalIdentifier;