"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _ = require('lodash');

const Ajv = require('ajv').default;

const traverse = require('json-schema-traverse');

const addFormats = require('ajv-formats').default;

const definitions = require('../../claim/definitions');

const credentialDefinitions = require('../../creds/definitions');

let summaryMap = {};
/**
 * Code generated to create a sumary map for a human readable output.
 */

class SummaryMapper {
  static addDefinition(def) {
    const textLabel = SummaryMapper.getTextLabel(def.identifier);

    if (textLabel) {
      const mapItem = _.get(summaryMap, textLabel);

      if (mapItem) {
        mapItem.labelFor.push(def.identifier);
      } else {
        summaryMap[textLabel] = {
          identifier: def.identifier,
          textLabel,
          credentials: SummaryMapper.getCredentials(def.identifier),
          labelFor: [def.identifier],
          changeable: SummaryMapper.isUpdatable(textLabel),
          claimPath: SummaryMapper.getClaimPath(def.identifier)
        };
      }
    }
  }

  static addCredentialDefinition(def) {
    const textLabel = SummaryMapper.getTextLabel(def.identifier);

    if (textLabel) {
      summaryMap[textLabel] = {
        identifier: def.identifier,
        textLabel,
        credentials: [def.identifier],
        labelFor: [def.identifier],
        changeable: SummaryMapper.isUpdatable(textLabel),
        claimPath: null
      };
    }
  }

  static getTextLabel(identifier) {
    // eslint-disable-next-line no-unused-vars
    const [type, name, version] = _.split(identifier, '-'); // eslint-disable-next-line no-unused-vars


    const [namespace, unique, path] = _.split(name, ':');

    if (type && unique) {
      return `${unique}.${type}${path ? `.${path}` : ''}`.toLowerCase();
    }

    return null;
  }

  static isUpdatable(textLabel) {
    const notUpdatable = ['document.placeofbirth.claim', 'document.dateofbirth.claim'];
    return !_.includes(notUpdatable, textLabel);
  }

  static getCredentials(identifier) {
    // eslint-disable-next-line no-unused-vars
    const [type, name, version] = _.split(identifier, '-');

    if (type === 'credential') {
      return [identifier];
    }

    const credentials = _.filter(credentialDefinitions, item => _.includes(item.depends, identifier));

    return _.map(credentials, item => item.identifier);
  }

  static getClaimPath(identifier) {
    // eslint-disable-next-line no-unused-vars
    const [type, name, version] = _.split(identifier, '-');

    if (type === 'credential') {
      return null;
    }

    return SummaryMapper.getPath(identifier);
  }

  static getBaseIdentifiers(identifier) {
    const claimRegex = /claim-cvc:(.*)\.(.*)-v\d*/;
    let isNewIdentifier = true;
    let identifierComponents = claimRegex.exec(identifier);

    if (identifierComponents === null) {
      identifierComponents = _.split(identifier, ':');
      isNewIdentifier = false;
    }

    return {
      identifierComponents,
      isNewIdentifier
    };
  }

  static getPath(identifier) {
    const {
      identifierComponents
    } = SummaryMapper.getBaseIdentifiers(identifier);

    const baseName = _.camelCase(identifierComponents[1]);

    return baseName !== 'type' ? `${baseName}.${identifierComponents[2]}` : identifierComponents[2];
  }

}

const getSchemaVersion = identifier => {
  const matches = identifier.match(/D-v([\d]+$)/);

  if (matches && matches.length > 1) {
    return matches[1];
  }

  return '1';
};

function transformUcaIdToClaimId(identifier) {
  const identifierComponents = identifier.split(':');
  return `claim-cvc:${identifierComponents[1]}.${identifierComponents[2]}-v1`;
}

function isDefinitionEqual(definition, ucaDefinition) {
  return definition.identifier === transformUcaIdToClaimId(ucaDefinition) || definition.identifier === ucaDefinition;
}

const isUCA = uca => /^[^:]+:[^:]+:[^:]+$/.test(uca);
/**
 * This class loads the schema definitions as needed by using loaders provided by the
 */


class SchemaLoader {
  constructor() {
    this.loaders = [];
    this.definitions = definitions;
    this.ucaDefinitions = [];
    this.credentialDefinitions = credentialDefinitions;
    this.summaryMap = summaryMap;
    this.validIdentifiers = [];
    this.validUcaIdentifiers = [];
    this.validCredentialIdentifiers = [];
    this.ucaCompared = [];
    this.ajv = new Ajv({
      logger: console,
      allErrors: true,
      verbose: true
    }); // add data formats such as date-time

    addFormats(this.ajv);
    this.ajv.addKeyword('attestable'); // Needed to add these to support "reversing" definitions back to the previous definitions for backwards
    // compatibilty. These should be removed?

    this.ajv.addKeyword('transient');
    this.ajv.addKeyword('credentialItem');
    this.ajv.addKeyword('alias');
    this.ajv.addKeyword('deambiguify');
  }

  reset() {
    this.ucaDefinitions.length = 0;
    this.definitions.length = 0;
    this.credentialDefinitions.length = 0;
    this.validIdentifiers.length = 0;
    this.validCredentialIdentifiers.length = 0;
    this.validUcaIdentifiers.length = 0;
    this.ajv.removeSchema(/.*/);
    summaryMap = {};
    this.summaryMap = summaryMap;
  }
  /**
   * Adds a schema loader which references where the schemas are loaded from
   */


  addLoader(loader) {
    this.loaders.push(loader);
  }

  loadSchemaFromUri(uri) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const title = uri.split('#')[0].match('[^/]+$', uri);
      const schema = yield _this.loadSchemaFromTitle(title[0]);
      return schema;
    })();
  }

  loadPropertySchema(schema, definition, ref, property) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const propertySchema = yield _this2.loadSchemaFromUri(ref);

      if (propertySchema !== null) {
        definition.depends.push(propertySchema.title);
      }

      if (schema.properties.claim.required && schema.properties.claim.required.includes(property)) {
        definition.required.push(propertySchema.title);
      }
    })();
  }
  /**
     * Adds a claim definition to be backwards compatible with the old schema structure.
     */


  addDefinition(schema) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      if (/^credential-/.test(schema.title)) {
        yield _this3.addCredentialDefinition(schema);
      } else {
        yield _this3.addClaimDefinition(schema);
      }
    })();
  }
  /**
   * Adds a credential definition to be backwards compatible with the old schema structure.
   */


  addCredentialDefinition(schema) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const definition = {
        identifier: schema.title,
        version: getSchemaVersion(schema.title),
        depends: []
      };

      if (schema.transient) {
        definition.transient = true;
      }

      if (schema.properties.claim.required) {
        definition.required = [];
      }

      const references = [];

      _.forEach(schema.properties.claim.properties, vo => {
        _.forEach(vo.properties, (vi, ki) => {
          references.push({
            ref: vo.properties[ki].$ref,
            property: ki
          });
        });
      });

      yield _.reduce(references, /*#__PURE__*/function () {
        var _ref = _asyncToGenerator(function* (promise, value) {
          yield promise;
          return _this4.loadPropertySchema(schema, definition, value.ref, value.property);
        });

        return function (_x, _x2) {
          return _ref.apply(this, arguments);
        };
      }(), Promise.resolve());

      _this4.credentialDefinitions.push(definition);

      _this4.validCredentialIdentifiers.push(definition.identifier);

      SummaryMapper.addCredentialDefinition(definition);
    })();
  }

  shouldAddClaimDefinition(schema) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      if (isUCA(schema.title)) {
        const transformed = transformUcaIdToClaimId(schema.title);

        if (!_this5.ucaCompared.includes(schema.title)) {
          yield _this5.loadSchemaFromTitle(transformed);
        }

        _this5.ucaCompared.push(schema.title);

        let found = false;

        _this5.definitions.some(definition => {
          if (isDefinitionEqual(definition, schema.title)) {
            found = true;
          }

          return found;
        });

        if (found) {
          return false;
        }
      }

      return true;
    })();
  }

  addClaimDefinition(schema) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      const definition = {
        identifier: schema.title,
        version: getSchemaVersion(schema.title),
        type: yield _this6.findDefinitionType(schema)
      };

      if (definition.type === 'Array') {
        const subSchema = yield _this6.loadSchemaFromUri(schema.items.$ref);
        definition.items = {
          type: subSchema.title
        };
      }

      ['attestable', 'credentialItem', 'minimum', 'maximum', 'alias', 'description'].forEach(property => {
        if (property in schema) {
          definition[property] = schema[property];
        }
      });

      if (schema.pattern) {
        // definition.pattern = new RegExp(schema.pattern.substring(1, schema.pattern.length - 1));
        definition.pattern = new RegExp(schema.pattern);
      }

      if (schema.required) {
        definition.type.required = schema.required;
      }

      if (schema.enum) {
        definition.enum = {};

        _.forEach(schema.enum, value => {
          definition.enum[value.toUpperCase()] = value;
        });
      }

      if (yield _this6.shouldAddClaimDefinition(schema)) {
        _this6.definitions.push(definition);

        _this6.validIdentifiers.push(schema.title);
      }

      if (isUCA(schema.title)) {
        _this6.ucaDefinitions.push(definition);

        _this6.validUcaIdentifiers.push(schema.title);
      }

      SummaryMapper.addDefinition(definition);
    })();
  }

  getPropertyValue(defProperties, property, name) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const {
        deambiguify,
        items
      } = property;
      let {
        type
      } = property;

      if (type === 'array' || items && items.$ref) {
        if (items.$ref) {
          const arraySchema = yield _this7.loadSchemaFromUri(items.$ref);
          type = arraySchema.title;
        } else {
          type = _.capitalize(type);
        }
      }

      if (property.allOf) {
        const schema = yield _this7.loadSchemaFromUri(property.allOf[0].$ref);
        type = schema.title;
      }

      const defProperty = {
        name,
        type
      };

      if (deambiguify) {
        defProperty.deambiguify = deambiguify;
      }

      defProperties.push(defProperty);
    })();
  }

  getPropertyValues(properties) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const defProperties = [];
      yield _.reduce(properties, /*#__PURE__*/function () {
        var _ref2 = _asyncToGenerator(function* (promise, value, name) {
          yield promise;
          return _this8.getPropertyValue(defProperties, value, name);
        });

        return function (_x3, _x4, _x5) {
          return _ref2.apply(this, arguments);
        };
      }(), Promise.resolve());
      return {
        properties: defProperties
      };
    })();
  }
  /**
   * Finds the definition/properties of a schema
   */


  findDefinitionType(schema) {
    var _this9 = this;

    return _asyncToGenerator(function* () {
      if (schema.allOf) {
        const subSchema = yield _this9.loadSchemaFromUri(schema.allOf[0].$ref);

        if (subSchema == null) {
          return null;
        }

        return subSchema.title;
      }

      if (schema.type === 'object') {
        if (!_.isEmpty(schema.properties)) {
          const values = yield _this9.getPropertyValues(schema.properties);
          return values;
        }
      }

      if (schema.type === 'array') {
        return 'Array';
      }

      return _.capitalize(schema.type);
    })();
  }
  /**
   * Loads a schema, traversing all the subschemas and loading them as well
   */


  loadSchemaFromTitle(title) {
    var _this10 = this;

    return _asyncToGenerator(function* () {
      const loader = _this10.findSchemaLoader(title);

      if (loader == null) {
        return null;
      }

      const schemaId = loader.schemaId(title);

      const existingSchema = _this10.ajv.getSchema(schemaId);

      let schema; // If AJV is unaware of the schema, look it up and create it

      if (!existingSchema) {
        schema = yield loader.loadSchema(title);

        if (schema === null) {
          return null;
        } // Loads all referenced schemas


        const references = [];
        traverse(schema, {
          cb: currentNode => {
            if (currentNode.$ref !== undefined) {
              // Prevent the same schema loaded multiple times
              references.push(_this10.loadSchemaFromUri(currentNode.$ref));
            }
          }
        });
        yield Promise.all(references);

        try {
          _this10.ajv.addSchema(schema);
        } catch (e) {// This could only happen if we have a cyclic dependency, or the same ref multiple times in the schema...
        }

        yield _this10.addDefinition(schema);
        return schema;
      }

      return existingSchema.schema;
    })();
  }
  /**
     * Finds the correct schema loader based on the identifier
     */


  findSchemaLoader(identifier) {
    return _.find(this.loaders, loader => loader.valid(identifier));
  }
  /**
   * Validates the schema based on identifier and supplied data.
   */


  validateSchema(identifier, data) {
    var _this11 = this;

    return _asyncToGenerator(function* () {
      const loader = _this11.findSchemaLoader(identifier);

      yield _this11.loadSchemaFromTitle(identifier);

      _this11.validate(loader.schemaId(identifier), data);
    })();
  }

  validate(schemaRef, value) {
    const validateSchema = this.ajv.getSchema(schemaRef);

    if (typeof validateSchema === 'undefined') {
      throw new Error(`Invalid schema id: ${schemaRef}`);
    }

    const valid = validateSchema(value);

    if (!valid) {
      _.forEach(validateSchema.errors, error => {
        if (error.params && error.params.missingProperty) {
          throw new Error(`Missing required fields to ${validateSchema.schema.title}`);
        }
      });

      throw new Error(`Invalid value. Errors: ${JSON.stringify(validateSchema.errors, null, 2)}`);
    }
  }

}

const schemaLoader = new SchemaLoader();
module.exports = {
  schemaLoader
};