const _ = require('lodash');
const Ajv = require('ajv').default;
const traverse = require('json-schema-traverse');
const addFormats = require('ajv-formats').default;
const definitions = require('../../claim/definitions');
const credentialDefinitions = require('../../creds/definitions');

const summaryMap = {};

/**
 * Code generated to create a sumary map for a human readable output.
 * TODO: This should be refactored out of credential commons?
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
          claimPath: SummaryMapper.getClaimPath(def.identifier),
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
        claimPath: null,
      };
    }
  }

  static getTextLabel(identifier) {
    // eslint-disable-next-line no-unused-vars
    const [type, name, version] = _.split(identifier, '-');
    // eslint-disable-next-line no-unused-vars
    const [namespace, unique, path] = _.split(name, ':');

    if (type && unique) {
      return `${unique}.${type}${path ? `.${path}` : ''}`.toLowerCase();
    }

    return null;
  }

  static isUpdatable(textLabel) {
    const notUpdatable = [
      'document.placeofbirth.claim',
      'document.dateofbirth.claim',
    ];
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
    return { identifierComponents, isNewIdentifier };
  }

  static getPath(identifier) {
    const { identifierComponents } = SummaryMapper.getBaseIdentifiers(identifier);
    const baseName = _.camelCase(identifierComponents[1]);
    return baseName !== 'type' ? `${baseName}.${identifierComponents[2]}` : identifierComponents[2];
  }
}

const getSchemaVersion = (identifier) => {
  const matches = identifier.match(/-v([\d]+$)/);
  if (matches && matches.length > 1) {
    return matches[1];
  }

  return '1';
};

/**
 * This class loads the schema definitions as needed by using loaders provided by the
 */
class SchemaLoader {
  constructor() {
    this.loaders = [];
    this.definitions = definitions;
    this.credentialDefinitions = credentialDefinitions;
    this.summaryMap = summaryMap;
    this.validIdentifiers = [];
    this.validCredentialIdentifiers = [];
    this.ajv = new Ajv({
      logger: console,
      allErrors: true,
      verbose: true,
    });

    // add data formats such as date-time
    addFormats(this.ajv);
    this.ajv.addKeyword('attestable');
    // Needed to add these to support "reversing" definitions back to the previous definitions for backwards
    // compatibilty. These should be removed?
    this.ajv.addKeyword('transient');
    this.ajv.addKeyword('credentialItem');
  }

  /**
   * Adds a schema loader which references where the schemas are loaded from
   */
  addLoader(loader) {
    this.loaders.push(loader);
  }

  async loadSchemaFromUri(uri) {
    const title = uri.split('#')[0].match('[^/]+$', uri);

    return this.loadSchemaFromTitle(title[0]);
  }

  /**
   * Adds a schema definition to be backwards compatible with the old schema structure.
   */
  async addDefinition(schema) {
    if (/^credential-/.test(schema.title)) {
      await this.addCredentialDefinition(schema);
    } else {
      await this.addClaimDefinition(schema);
    }
  }

  /**
   *
   * @param schema
   * @returns {Promise<void>}
   */
  async addCredentialDefinition(schema) {
    const definition = {
      identifier: schema.title,
      version: getSchemaVersion(schema.title),
      depends: [],
    };

    if (schema.transient) {
      definition.transient = true;
    }

    if (schema.properties.claim.required) {
      definition.required = [];
    }

    // TODO: clean this section
    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const k in schema.properties.claim.properties) {
      const v = schema.properties.claim.properties[k];
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const ki in v.properties) {
        const vi = v.properties[ki];

        // eslint-disable-next-line no-await-in-loop
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
    SummaryMapper.addCredentialDefinition(definition);
  }

  async addClaimDefinition(schema) {
    const definition = {
      identifier: schema.title,
      version: getSchemaVersion(schema.title),
      type: await this.findDefinitionType(schema),
    };

    if (definition.type === 'Array') {
      const subSchema = await this.loadSchemaFromUri(schema.items.$ref);

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
    SummaryMapper.addDefinition(definition);
  }

  async getPropertyValues(properties) {
    const defProperties = [];

    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const name in properties) {
      const property = properties[name];

      let { type } = property;
      const { items } = property;

      if (type === 'array') {
        if (items.$ref) {
          // TODO: remove hardcode identifier
          type = items.$ref.replace('http://identity.com/schemas/', '');
        } else {
          type = _.capitalize(type);
        }
      }

      if (property.allOf) {
        // eslint-disable-next-line no-await-in-loop
        const schema = await this.loadSchemaFromUri(property.allOf[0].$ref);
        type = schema.title;
      }

      const defProperty = { name, type };

      defProperties.push(defProperty);
    }

    return { properties: defProperties };
  }

  /**
   * Finds the definition/properties of a schema
   */
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

  /**
   * Loads a schema, traversing all the subschemas and loading them as well
   */
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
        // TODO: This could only happen if we have a cyclic dependency, or the same ref multiple times in the schema...
        return schema;
      }

      await this.addDefinition(schema);

      const references = [];
      traverse(schema, {
        cb: (currentNode) => {
          if (currentNode.$ref !== undefined) {
            // TODO: Prevent the same schema loaded multiple times
            references.push(this.loadSchemaFromUri(currentNode.$ref));
          }
        },
      });

      await Promise.all(references);
    } else {
      schema = await loader.loadSchema(title);
    }

    return schema;
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
  async validateSchema(identifier, data) {
    const loader = this.findSchemaLoader(identifier);

    await this.loadSchemaFromTitle(identifier);

    this.validate(loader.schemaId(identifier), data);
  }

  validate(schemaRef, value) {
    const validateSchema = this.ajv.getSchema(schemaRef);

    if (typeof validateSchema === 'undefined') {
      throw new Error(`Invalid schema id: ${schemaRef}`);
    }

    const valid = validateSchema(value);

    if (!valid) throw new Error(`Invalid value. Errors: ${JSON.stringify(validateSchema.errors, null, 2)}`);
  }
}

const schemaLoader = new SchemaLoader();

module.exports = { schemaLoader };
