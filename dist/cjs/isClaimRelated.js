"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const {
  definitions,
  Claim
} = require('./claim/Claim');

const vcDefinitions = require('./creds/definitions');

const {
  schemaLoader
} = require('./schemas/jsonSchema');
/**
 * Validate an claim path against it's parent UserCollectableAttribute, and the parent Claim against the
 * dependencies of an Credential
 * @param claim path, eg: name.first
 * @param uca the global identifier for the UCA/Claim, eg: claim-civ:Identity:name-1
 * @param credential the parent identifier, eg: civ:Credential:GenericId
 * @return true if the dependency exists and false if it doesn't
 */


function isClaimRelated(_x, _x2, _x3) {
  return _isClaimRelated.apply(this, arguments);
}

function _isClaimRelated() {
  _isClaimRelated = _asyncToGenerator(function* (claim, uca, credential) {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    yield schemaLoader.loadSchemaFromTitle(claim);
    yield schemaLoader.loadSchemaFromTitle(uca);
    yield schemaLoader.loadSchemaFromTitle(credential); // first get the UCA identifier

    const ucaIdentifier = uca.substring(uca.indexOf('-') + 1, uca.lastIndexOf('-')); // Load the schema and it's references from a source to be used for validation and defining the schema definitions

    yield schemaLoader.loadSchemaFromTitle(ucaIdentifier); // check on the credential commons if this identifier exists

    const ucaDefinition = definitions.find(definition => definition.identifier === ucaIdentifier); // does the UCA exist?

    if (ucaDefinition) {
      const ucaProperties = yield Claim.getAllProperties(ucaIdentifier); // does the claim exists in the Claim?

      if (_.includes(ucaProperties, claim)) {
        // we now have the composite uca, the uca for the claim property, they both are correct
        // we need to check now the UCA is inside the dependencies of the credential refered as parent
        const credentialDefinition = vcDefinitions.find(definition => definition.identifier === credential);

        if (credentialDefinition) {
          return _.includes(credentialDefinition.depends, ucaIdentifier);
        }

        throw new Error('Credential identifier does not exist');
      } else {
        throw new Error('Claim property path does not exist on UCA definitions');
      }
    } else {
      // return error about wrong uca identifier
      throw new Error('UCA identifier does not exist');
    }
  });
  return _isClaimRelated.apply(this, arguments);
}

module.exports = isClaimRelated;