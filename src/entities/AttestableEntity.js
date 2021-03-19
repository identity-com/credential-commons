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

  __getAttestableValue(path, isArrayItem = false) {
    // According to new convention, `parsedIdentifier.name` has format of
    // "Collection.propertyName"
    let [, propertyName] = this.parsedIdentifier.name.split('.');

    if (isArrayItem) {
      // we need to supress the root path
      propertyName = null;
    }

    if (path) {
      propertyName = `${path}.${propertyName}`;
    }

    // it was defined that the attestable value would be on the URN type https://tools.ietf.org/html/rfc8141
    // TODO: Is it safer in runtime to determine return based on `this.value` typeof, rather than `this.type`?
    if (['string', 'number', 'boolean'].indexOf(this.type) >= 0) {
      return `urn:${propertyName}:${this.salt}:${this.value}|`;
    } if (this.type === 'array') {
      const itemsValues = _.reduce(this.value,
        (result, item) => `${result}${item.getAttestableValue(null, true)},`, '');
      return `urn:${propertyName}:${this.salt}:[${itemsValues}]`;
    }

    console.log(this.value);

    return _.reduce(_.sortBy(_.keys(this.value)),
      (s, k) => {
        console.log('a');
        console.log(this.parsedIdentifier);
        console.log(this.schema);

        for (const i in this.parsedIdentifier) {
          console.log(`:::::: ${i}`);
        }

        return `${s}${this.value[k].getAttestableValue(propertyName)}`;
      }, '');
  }

  getAttestableValues() {
    const values = [];
    const def = this.parsedIdentifier;
    if (def.schemaInformation.schema.attestable) {
      values.push({ identifier: this.identifier, value: this.getAttestableValue() });
      if (this.type === 'object') {
        _.forEach(_.keys(this.value), (k) => {
          // TODO: Nested values of root Claim are not Claims, have to change usage of
          //  `this.value[k].getAttestableValues()` to recurse parsing
          const innerValues = this.value[k].getAttestableValues();
          _.reduce(innerValues, (res, iv) => res.push(iv), values);
        });
      }
    }
    return values;
  }
}

module.exports = { AttestableEntity };
