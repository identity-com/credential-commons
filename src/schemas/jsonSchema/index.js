const _ = require('lodash');
const Ajv = require('ajv').default;
const traverse = require('json-schema-traverse');
const addFormats = require('ajv-formats').default;
const { UCASchemaLoader } = require('./loaders/uca');
const { CVCSchemaLoader } = require('./loaders/cvc');
const definitions = require('../../claim/definitions');

class SchemaLoader {
  constructor() {
    this.loaders = [];
    this.definitions = definitions;
    this.validIdentifiers = [];

    this.ajv = new Ajv({
      logger: console,
      allErrors: true,
      verbose: true,
    });

    // add data formats such as date-time
    addFormats(this.ajv);
    this.ajv.addKeyword('attestable');
    this.ajv.addKeyword('transient');
    this.ajv.addKeyword('credentialItem');

    this.addLoader(new UCASchemaLoader());
    this.addLoader(new CVCSchemaLoader());
  }

  addLoader(loader) {
    this.loaders.push(loader);
  }

  loadSchemaFromUri(uri) {
    const title = uri.split('#')[0].match('[^/]+$', uri);

    return this.loadSchemaFromTitle(title[0]);
  }

  addDefinition(schema) {
    const definition = {
      identifier: schema.title,
      version: '1',
      type: this.findDefinitionType(schema),
    };

    if (definition.type === 'Array') {
      const subSchema = this.loadSchemaFromUri(schema.items.$ref);

      definition.items = {
        type: subSchema.title,
      };
    }

    ['attestable', 'credentialItem', 'minimum', 'maximum'].forEach((property) => {
      if (property in schema) {
        definition[property] = schema[property];
      }
    });

    if (schema.required) {
      definition.type.required = schema.required;
    }

    this.definitions.push(definition);
    this.validIdentifiers.push(schema.title);
  }

  getPropertyValues(properties) {
    const defProperties = [];

    _.forEach(properties, (property, name) => {
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
        type = this.loadSchemaFromUri(property.allOf[0].$ref).title;
      }

      const defProperty = { name, type };

      defProperties.push(defProperty);
    });

    return { properties: defProperties };
  }

  findDefinitionType(schema) {
    if (schema.type === 'object') {
      if (!_.isEmpty(schema.properties)) {
        return this.getPropertyValues(schema.properties);
      }
      const subSchema = this.loadSchemaFromUri(schema.allOf[0].$ref);
      if (subSchema == null) {
        return null;
      }

      return subSchema.title;
    }

    if (schema.type === 'array') {
      return 'Array';
    }

    return _.capitalize(schema.type);
  }

  loadSchemaFromTitle(title) {
    const loader = this.findSchemaLoader(title);
    if (loader == null) {
      return null;
    }

    const schemaId = loader.schemaId(title);
    const validateSchema = this.ajv.getSchema(schemaId);

    let schema;
    if (!validateSchema) {
      schema = loader.loadSchema(title);

      this.ajv.addSchema(schema);

      this.addDefinition(schema);

      traverse(schema, {
        // eslint-disable-next-line no-unused-vars
        cb: (currentNode, currentPath, currentSchema, parent, nodeName) => {
          if (currentNode.$ref !== undefined) {
            // found the properties reference
            this.loadSchemaFromUri(currentNode.$ref);
          }
        },
      });
    } else {
      schema = loader.loadSchema(title);
    }

    return schema;
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
    _.forEach(this.loaders, (loader) => {
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
    const loader = this.findSchemaLoader(title);

    this.loadSchemaFromTitle(title);

    this.validate(loader.schemaId(title), data);
  }
}

const schemaLoader = new SchemaLoader();

module.exports = { schemaLoader };
