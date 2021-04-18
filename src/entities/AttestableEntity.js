const _ = require('lodash');
const sjcl = require('sjcl');
const { ParsedIdentifier } = require('./ParsedIdentifier');
const { services } = require('../services');
const DEFAULT_BUILDER = require('../schema/jsonSchema');

class AttestableEntity {
  get identifier() {
    return this.parsedIdentifier.identifier;
  }

  constructor(identifier, value, uriPrefix, builder = DEFAULT_BUILDER, validate = true) {
    if (_.isEmpty(identifier)) {
      throw new Error('No identifier specified');
    }

    this.parsedIdentifier = new ParsedIdentifier(identifier, uriPrefix, builder);

    const { schemaInformation } = this.parsedIdentifier;

    this.schemaInformation = schemaInformation;
    if (validate) {
      builder.validate(schemaInformation.ref, value);
    }

    this.schema = schemaInformation.schema;

    this.value = value;
    this.version = this.parsedIdentifier.version;
    this.type = this.schema.type;
    this.builder = builder;

    const secureRandom = services.container.SecureRandom;
    this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(secureRandom.wordWith(64)));
  }

  validate() {
    this.builder.validate(this.schemaInformation.ref, this.value);
  }
}

module.exports = { AttestableEntity };
