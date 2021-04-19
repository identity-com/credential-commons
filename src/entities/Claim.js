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
    if (typeof value === 'object' && !_.isEmpty(value.attestableValue)) {
      const rootIdentifier = identifier.replace(/^[^:]+:[^.]+\.([^-]+)-v[0-9]+/, '$1');
      _.forEach(value.attestableValue.split('|'), (part) => {
        if (!_.isEmpty(part)) {
          const parts = part.split(':');
          const subPath = parts[1].replace(new RegExp(`^${rootIdentifier}\\.?`), '');

          let newValue = parts[3];
          // TODO: Consider this ?
          if (newValue === 'null') {
            newValue = null;
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

  // TODO: Handling Array Types
  schemaWithProperties(schema) {
    const newSchema = _.clone(schema);
    if (newSchema.type !== 'object') {
      return newSchema;
    }

    if (!_.isEmpty(schema.allOf)) {
      _.forEach(schema.allOf, (allOf) => {
        if (!_.isEmpty(allOf.$ref)) {
          const split = allOf.$ref.split('#');
          const innerSchema = this.builder.loadSchemaObject(split[0]);
          const propertyPath = split[1].replace(/^\//, '').replace(/\//, '.');

          const details = _.get(innerSchema.schema, propertyPath);

          if (_.isEmpty(newSchema.properties)) {
            newSchema.properties = {};
          }

          if (!_.isEmpty(details.attestable)) {
            newSchema.attestable = details.attestable;
          }

          newSchema.properties = _.merge(newSchema.properties, details.properties);
        } else {
          throw new Error('Handle other allOf possiblity');
        }
      });
    }

    // TODO: Risk of never ending recursion here... better way would be to compare against which values actually exist
    //  at this level and avoid recursing further if no value is set
    _.forEach(newSchema.properties, (property, name) => {
      newSchema.properties[name] = this.schemaWithProperties(property);
    });

    return newSchema;
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
      const x = this;
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
