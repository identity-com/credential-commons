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

    if (typeof value === 'object' && !_.isEmpty(value.attestableValue)) {
      const rootIdentifier = identifier.replace(/^[^:]+:[^.]+\.([^-]+)-v[0-9]+/, '$1');
      const schemaWithProperties = builder.schemaWithProperties(this.schemaInformation.schema);

      _.forEach(value.attestableValue.split('|'), (part) => {
        if (!_.isEmpty(part)) {
          const parts = part.split(':');
          const subPath = parts[1].replace(new RegExp(`^${rootIdentifier}\\.?`), '');

          let newValue = parts[3];
          // TODO: Consider this ?
          if (newValue === 'null') {
            newValue = null;
          }

          const propertyTypePath = `properties.${subPath.replace('.', '.properties')}.type`;
          const type = _.get(schemaWithProperties, propertyTypePath);

          if (type === 'number' && newValue !== null) {
            newValue = Number(newValue);
          }

          if (_.isEmpty(subPath)) {
            value = newValue;
          } else {
            _.set(value, subPath, newValue);
          }
        }
      });

      if (!_.isEmpty(value) && typeof value === 'object') {
        delete value.attestableValue;
      }
    }

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
