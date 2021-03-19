const _ = require('lodash');
const sjcl = require('sjcl');
const { ParsedIdentifier } = require('./ParsedIdentifier');
const { services } = require('../services');
const DEFAULT_BUILDER = require('../schema/jsonSchema');

class AttestableEntity {
  get identifier() {
    return this.parsedIdentifier.identifier;
  }

  constructor(identifier, value, uriPrefix, builder = DEFAULT_BUILDER) {
    this.parsedIdentifier = new ParsedIdentifier(identifier, uriPrefix, builder);

    const { schemaInformation } = this.parsedIdentifier;

    builder.validate(schemaInformation.ref, value);
    this.schema = schemaInformation.schema;

    this.value = value;
    this.version = this.parsedIdentifier.version;
    this.type = this.schema.type;
    this.builder = builder;

    const secureRandom = services.container.SecureRandom;
    this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(secureRandom.wordWith(64)));
  }

  getAttestableValue(object, property = null, path = null) {
    // TODO: ignore values where schema attestable = false
    let propertyName;
    let value;
    if (property == null) {
      value = object;
      propertyName = '';
    } else {
      value = object[property];
      propertyName = path == null ? property : `${path}.${property}`;
    }

    if (['string', 'number', 'boolean'].includes(typeof value)) {
      return `urn:${propertyName}:${this.salt}:${value}|`;
    } if (Array.isArray(value)) {
      // TODO: add array handling
      throw new Error('unsupported');
    }

    return _.reduce(_.sortBy(_.keys(value)),
      (s, k) => `${s}${this.getAttestableValue(value, k, propertyName)}`, '');
  }

  getAttestableValues() {
    return this.getAttestableValue(this.value);
  }
}

module.exports = { AttestableEntity };
