"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const {
  schemaLoader
} = require('./schemas/jsonSchema');

const validUCAIdentifiers = schemaLoader.validIdentifiers;
const validClaimIdentifiers = schemaLoader.validIdentifiers;
const validVCIdentifiers = schemaLoader.validCredentialIdentifiers;
const validPrefixes = ['claim', 'credential'];

function isValidGlobalIdentifier(_x) {
  return _isValidGlobalIdentifier.apply(this, arguments);
}

function _isValidGlobalIdentifier() {
  _isValidGlobalIdentifier = _asyncToGenerator(function* (identifier) {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    yield schemaLoader.loadSchemaFromTitle(identifier);

    const splited = _.split(identifier, '-');

    if (splited.length !== 3) {
      throw new Error('Malformed Global Identifier');
    }

    if (!_.includes(validPrefixes, splited[0])) {
      throw new Error('Invalid Global Identifier Prefix');
    }

    switch (splited[0]) {
      case 'claim':
        if (!_.includes(validUCAIdentifiers, splited[1]) && !_.includes(validClaimIdentifiers, identifier)) {
          throw new Error(`${identifier} is not valid`);
        }

        return true;

      case 'credential':
        if (!_.includes(validVCIdentifiers, splited[1]) && !_.includes(validVCIdentifiers, identifier)) {
          throw new Error(`${identifier} is not valid`);
        }

        return true;

      default:
        return false;
    }
  });
  return _isValidGlobalIdentifier.apply(this, arguments);
}

module.exports = isValidGlobalIdentifier;