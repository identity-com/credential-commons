const _ = require('lodash');
const { AttestableEntity } = require('./AttestableEntity');
const DEFAULT_BUILDER = require('../schema/jsonSchema');

const attestableValueRegex = /^urn:(\w+(?:\.\w+)*):(\w+):(.+)/;

const isNotNull = (value) => value !== null;

class Claim extends AttestableEntity {
  static parseAttestableValue(value) {
    if (!value || !value.attestableValue) throw new Error('Missing attestableValue');

    const splitPipes = value.attestableValue.split('|');

    const attestableValues = splitPipes.map((stringValue) => {
      const match = attestableValueRegex.exec(stringValue);
      if (match && match.length === 4) {
        return {
          propertyName: match[1],
          salt: match[2],
          value: match[3],
          stringValue,
        };
      }

      return null;
    }).filter(isNotNull);

    if (splitPipes.length !== attestableValues.length && splitPipes.length !== attestableValues.length + 1) {
      throw new Error('Invalid attestableValue');
    }

    return attestableValues;
  }

  constructor(identifier, value, uriPrefix, builder = DEFAULT_BUILDER) {
    super(identifier, value, uriPrefix, builder);

    const details = this.getDetailsForSchema(this.parsedIdentifier.schemaInformation);
    this.type = details.type;
    this.attestable = details.attestable === true;

    this.subclaims = {};
    if (details.type === 'object') {
      _.forEach(value, (subValue, name) => {
        const subIdentifier = `${this.parsedIdentifier.type}-${this.parsedIdentifier.name}.${name}-v${this.parsedIdentifier.version}`;

        this.subclaims[name] = new Claim(subIdentifier, subValue, uriPrefix, builder);
      });
    }
  }

  getAttestableValue(parentPath) {
    if (this.type === 'object') {
      const name = `${_.last(this.getClaimPath().split('.'))}.`;
      let ret = '';
      _.forEach(this.subclaims, (subClaim) => {
        ret += subClaim.getAttestableValue(name);
      });
      return ret;
    } if (this.type === 'array') {
      throw new Error('no array handling');
    } else {
      // TODO: is this correct
      const path = _.last(this.parsedIdentifier.name.split('.'));
      return `urn:${parentPath == null ? '' : parentPath}${path}:${this.salt}:${this.value}|`;
    }
  }

  getClaimPath() {
    return _.lowerFirst(this.parsedIdentifier.name.replace(/^[^:]+:/, ''));
  }

  getDetailsForSchema(schemaInformation) {
    const split = schemaInformation.ref.split('#');
    if (split.length === 1) {
      return schemaInformation.schema;
    }

    const subSchema = this.builder.loadSchemaObject(split[0]);

    const propertyPath = split[1].replace(/^\//, '').replace(/\//g, '.');

    return _.get(subSchema.schema, propertyPath);
  }

  addAttestableValues(list) {
    list.push({
      identifier: this.identifier,
      value: this.getAttestableValue(),
      claimPath: this.getClaimPath(),
    });

    _.forEach(this.subclaims, (subclaim) => {
      if (subclaim.attestable) {
        subclaim.addAttestableValues(list);
      }
    });
  }

  getAttestableValue(parentPath) {
    if (this.type === 'object') {
      const name = `${_.last(this.getClaimPath().split('.'))}.`;
      let ret = '';
      _.forEach(this.subclaims, (subClaim) => {
        ret += subClaim.getAttestableValue(name);
      });
      return ret;
    } if (this.type === 'array') {
      const arraySchema = this.builder.loadSchemaObject(this.schema.items.$ref);

      const itemsValues = _.reduce(this.value,
        (result, item) => `${result}${new Claim(arraySchema.schema.title, item).getAttestableValue(null)},`, '');
      return `urn:${parentPath}:${this.salt}:[${itemsValues}]`;
    }
    // TODO: is this correct
    const path = _.last(this.parsedIdentifier.name.split('.'));
    return `urn:${parentPath == null ? '' : parentPath}${path}:${this.salt}:${this.value}|`;
  }
}

module.exports = { Claim };
