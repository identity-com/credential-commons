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

  async loadSchemaFromUri(uri) {
    const title = uri.split('#')[0].match('[^/]+$', uri);

    return this.loadSchemaFromTitle(title[0]);
  }

  async addDefinition(schema) {
    if (/^credential-/.test(schema.title)) {
      await this.addCredentialDefinition(schema);
    } else {
      await this.addClaimDefinition(schema);
    }
  }

  async addCredentialDefinition(schema) {
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

        const propertySchema = await this.loadSchemaFromUri(vi.$ref);

        if (propertySchema !== null) {
          definition.depends.push(propertySchema.title);
        }

        if (schema.properties.claim.required && schema.properties.claim.required.includes(ki)) {
          definition.required.push(propertySchema.title);
        }
      }
    }

    this.credentialDefinitions.push(definition);
    this.validCredentialIdentifiers.push(definition.identifier);
    this.summaryMapper.addCredentialDefinition(definition);
  }

  async addClaimDefinition(schema) {
    const definition = {
      identifier: schema.title,
      version: '1',
      type: await this.findDefinitionType(schema)
    };

    if (definition.type === 'Array') {
      const subSchema = await this.loadSchemaFromUri(schema.items.$ref);

      definition.items = {
        type: subSchema.title
      };
    }

    ['attestable', 'credentialItem', 'minimum', 'maximum'].forEach(property => {
      if (property in schema) {
        definition[property] = schema[property];
      }
    });

    if (schema.required) {
      definition.type.required = schema.required;
    }

    this.definitions.push(definition);
    this.validIdentifiers.push(schema.title);
    this.summaryMapper.addDefinition(definition);
  }

  async getPropertyValues(properties) {
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
        const schema = await this.loadSchemaFromUri(property.allOf[0].$ref);
        type = schema.title;
      }

      const defProperty = { name, type };

      defProperties.push(defProperty);
    }

    return { properties: defProperties };
  }

  async findDefinitionType(schema) {
    if (schema.type === 'object') {
      if (!_.isEmpty(schema.properties)) {
        const values = await this.getPropertyValues(schema.properties);
        return values;
      }
      const subSchema = await this.loadSchemaFromUri(schema.allOf[0].$ref);
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

  async loadSchemaFromTitle(title) {
    const loader = this.findSchemaLoader(title);
    if (loader == null) {
      return null;
    }

    const schemaId = loader.schemaId(title);
    const validateSchema = this.ajv.getSchema(schemaId);

    let schema;
    if (!validateSchema) {
      schema = await loader.loadSchema(title);
      if (schema === null) {
        return null;
      }

      try {
        this.ajv.addSchema(schema);
      } catch (e) {
        // TODO: This could only happen if we have cyclic dependancies... find a better way to handle it
        return null;
      }

      await this.addDefinition(schema);

      const references = [];
      traverse(schema, {
        cb: currentNode => {
          if (currentNode.$ref !== undefined) {
            references.push(this.loadSchemaFromUri(currentNode.$ref));
          }
        }
      });

      await Promise.all(references);
    } else {
      schema = await loader.loadSchema(title);
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

  async validateSchema(title, data) {
    const loader = this.findSchemaLoader(title);

    await this.loadSchemaFromTitle(title);

    this.validate(loader.schemaId(title), data);
  }
}

const schemaLoader = new SchemaLoader();

module.exports = { schemaLoader };