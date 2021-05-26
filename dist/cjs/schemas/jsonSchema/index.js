'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const _ = require('lodash');
const Ajv = require('ajv').default;
const traverse = require('json-schema-traverse');
const addFormats = require('ajv-formats').default;
const { UCASchemaLoader } = require('./loaders/uca');
const { CVCSchemaLoader } = require('./loaders/cvc');
const definitions = require('../../claim/definitions');
const credentialDefinitions = require('../../creds/definitions');

const summaryMap = {};
class SummaryMapper {
  addDefinition(def) {
    const textLabel = this.getTextLabel(def.identifier);

    if (textLabel) {
      const mapItem = _.get(summaryMap, textLabel);
      if (mapItem) {
        mapItem.labelFor.push(def.identifier);
      } else {
        summaryMap[textLabel] = {
          // TODO Martin: I feel "identifier" should be removed since only labelFor should be used.
          identifier: def.identifier,
          textLabel,
          credentials: this.getCredentials(def.identifier),
          labelFor: [def.identifier],
          changeable: this.isUpdatable(textLabel),
          claimPath: this.getClaimPath(def.identifier)
        };
      }
    }
  }

  addCredentialDefinition(def) {
    const textLabel = this.getTextLabel(def.identifier);

    if (textLabel) {
      summaryMap[textLabel] = {
        identifier: def.identifier,
        textLabel,
        credentials: [def.identifier],
        labelFor: [def.identifier],
        changeable: this.isUpdatable(textLabel),
        claimPath: null
      };
    }
  }

  getTextLabel(identifier) {
    const [type, name, version] = _.split(identifier, '-');
    const [namespace, unique, path] = _.split(name, ':');

    if (type && unique) {
      return `${unique}.${type}${path ? `.${path}` : ''}`.toLowerCase();
    }
  }

  isUpdatable(textLabel) {
    const notUpdatable = ['document.placeofbirth.claim', 'document.dateofbirth.claim'];
    return !_.includes(notUpdatable, textLabel);
  }

  getCredentials(identifier) {
    const [type, name, version] = _.split(identifier, '-');

    if (type === 'credential') {
      return [identifier];
    }

    const credentials = _.filter(credentialDefinitions, item => _.includes(item.depends, identifier));

    return _.map(credentials, item => item.identifier);
  }

  getClaimPath(identifier) {
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
    return { identifierComponents, isNewIdentifier };
  }

  static getPath(identifier) {
    const { identifierComponents } = SummaryMapper.getBaseIdentifiers(identifier);
    const baseName = _.camelCase(identifierComponents[1]);
    return baseName !== 'type' ? `${baseName}.${identifierComponents[2]}` : identifierComponents[2];
  }
}

class SchemaLoader {
  constructor() {
    this.loaders = [];
    this.definitions = definitions;
    this.credentialDefinitions = credentialDefinitions;
    this.summaryMap = summaryMap;
    this.summaryMapper = new SummaryMapper();
    this.validIdentifiers = [];
    this.validCredentialIdentifiers = [];
    this.ajv = new Ajv({
      logger: console,
      allErrors: true,
      verbose: true
    });

    // add data formats such as date-time
    addFormats(this.ajv);
    this.ajv.addKeyword('attestable');
    // Needed to add these to support "reversing" definitions back to the previous definitions for backwards
    // compatibilty
    this.ajv.addKeyword('transient');
    this.ajv.addKeyword('credentialItem');

    this.addLoader(new UCASchemaLoader());
    this.addLoader(new CVCSchemaLoader());
  }

  addLoader(loader) {
    this.loaders.push(loader);
  }

  loadSchemaFromUri(uri) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const title = uri.split('#')[0].match('[^/]+$', uri);

      return _this.loadSchemaFromTitle(title[0]);
    })();
  }

  addDefinition(schema) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      if (/^credential-/.test(schema.title)) {
        yield _this2.addCredentialDefinition(schema);
      } else {
        yield _this2.addClaimDefinition(schema);
      }
    })();
  }

  addCredentialDefinition(schema) {
    var _this3 = this;

    return _asyncToGenerator(function* () {
      const definition = {
        identifier: schema.title,
        version: '1',
        depends: []
      };

      if (schema.transient) {
        definition.transient = true;
      }

      if (schema.properties.claim.required) {
        definition.required = [];
      }

      for (const k in schema.properties.claim.properties) {
        const v = schema.properties.claim.properties[k];
        for (const ki in v.properties) {
          const vi = v.properties[ki];

          const propertySchema = yield _this3.loadSchemaFromUri(vi.$ref);

          if (propertySchema !== null) {
            definition.depends.push(propertySchema.title);
          }

          if (schema.properties.claim.required && schema.properties.claim.required.includes(ki)) {
            definition.required.push(propertySchema.title);
          }
        }
      }

      _this3.credentialDefinitions.push(definition);
      _this3.validCredentialIdentifiers.push(definition.identifier);
      _this3.summaryMapper.addCredentialDefinition(definition);
    })();
  }

  addClaimDefinition(schema) {
    var _this4 = this;

    return _asyncToGenerator(function* () {
      const definition = {
        identifier: schema.title,
        version: '1',
        type: yield _this4.findDefinitionType(schema)
      };

      if (definition.type === 'Array') {
        const subSchema = yield _this4.loadSchemaFromUri(schema.items.$ref);

        definition.items = {
          type: subSchema.title
        };
      }

      ['attestable', 'credentialItem', 'minimum', 'maximum'].forEach(function (property) {
        if (property in schema) {
          definition[property] = schema[property];
        }
      });

      if (schema.required) {
        definition.type.required = schema.required;
      }

      _this4.definitions.push(definition);
      _this4.validIdentifiers.push(schema.title);
      _this4.summaryMapper.addDefinition(definition);
    })();
  }

  getPropertyValues(properties) {
    var _this5 = this;

    return _asyncToGenerator(function* () {
      const defProperties = [];

      for (const name in properties) {
        const property = properties[name];
        let { type } = property;
        const { items } = property;

        if (type === 'array') {
          if (items.$ref) {
            type = items.$ref.replace('http://identity.com/schemas/', '');
          } else {
            type = _.capitalize(type);
          }
        }

        if (property.allOf) {
          const schema = yield _this5.loadSchemaFromUri(property.allOf[0].$ref);
          type = schema.title;
        }

        const defProperty = { name, type };

        defProperties.push(defProperty);
      }

      return { properties: defProperties };
    })();
  }

  findDefinitionType(schema) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (schema.type === 'object') {
        if (!_.isEmpty(schema.properties)) {
          const values = yield _this6.getPropertyValues(schema.properties);
          return values;
        }
        const subSchema = yield _this6.loadSchemaFromUri(schema.allOf[0].$ref);
        if (subSchema == null) {
          return null;
        }

        return subSchema.title;
      }

      if (schema.type === 'array') {
        return 'Array';
      }

      return _.capitalize(schema.type);
    })();
  }

  loadSchemaFromTitle(title) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      const loader = _this7.findSchemaLoader(title);
      if (loader == null) {
        return null;
      }

      const schemaId = loader.schemaId(title);
      const validateSchema = _this7.ajv.getSchema(schemaId);

      let schema;
      if (!validateSchema) {
        schema = yield loader.loadSchema(title);
        if (schema === null) {
          return null;
        }

        try {
          _this7.ajv.addSchema(schema);
        } catch (e) {
          // TODO: This could only happen if we have cyclic dependancies... find a better way to handle it
          return null;
        }

        yield _this7.addDefinition(schema);

        const references = [];
        traverse(schema, {
          cb: function (currentNode) {
            if (currentNode.$ref !== undefined) {
              references.push(_this7.loadSchemaFromUri(currentNode.$ref));
            }
          }
        });

        yield Promise.all(references);
      } else {
        schema = yield loader.loadSchema(title);
      }

      return schema;
    })();
  }

  validate(schemaRef, value) {
    const validateSchema = this.ajv.getSchema(schemaRef);

    if (typeof validateSchema === 'undefined') {
      throw new Error(`Invalid schema id: ${schemaRef}`);
    }

    const valid = validateSchema(value);

    if (!valid) throw new Error(`Invalid value. Errors: ${JSON.stringify(validateSchema.errors, null, 2)}`);
  }

  findSchemaLoader(title) {
    let found = null;
    _.forEach(this.loaders, loader => {
      if (loader.valid(title)) {
        found = loader;
      }
    });

    if (found == null) {
      return null;
    }

    return found;
  }

  validateSchema(title, data) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      const loader = _this8.findSchemaLoader(title);

      yield _this8.loadSchemaFromTitle(title);

      _this8.validate(loader.schemaId(title), data);
    })();
  }
}

const schemaLoader = new SchemaLoader();

module.exports = { schemaLoader };