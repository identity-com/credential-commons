const { parseIdentifier } = require('../../../lib/stringUtils');
const { services } = require('../../../services');

const rootUri = 'http://identity.com/schemas/';

class CVCSchemaLoader {
  constructor(baseRemoteUri = undefined) {
    this.baseRemoteUri = baseRemoteUri;
  }

  /**
   * Gets the schema id based on the identifier
   */
  // eslint-disable-next-line class-methods-use-this
  schemaId(identifier) {
    return rootUri + identifier;
  }

  /**
   * Tests to see if this loader is valid for the supplied identifier
   */
  // eslint-disable-next-line class-methods-use-this
  valid(identifier) {
    return /^(claim|credential|type)-(cvc|alt):.*$/.test(identifier) || /^cvc:.*$/.test(identifier);
  }

  /**
   * Loads the schema based on the identifier
   */
  async loadSchema(identifier) {
    let identifierPath;

    if (/^cvc:.*$/.test(identifier)) {
      identifierPath = `uca/1/uca-${identifier}`;
    } else {
      const parsedIdentifier = parseIdentifier(identifier);

      identifierPath = `${parsedIdentifier[1]}/${parsedIdentifier[4]}/${parsedIdentifier[1]}-${parsedIdentifier[2]}`;
    }

    let schema = CVCSchemaLoader.local(identifierPath);

    // Only load the schema remotely if a base url was provided and none was found locally
    if (this.baseRemoteUri && schema === null) {
      schema = await CVCSchemaLoader.remote(identifierPath);
    }

    return schema;
  }

  static async remote(identifierPath) {
    const uri = `${this.baseRemoteUri}/${identifierPath}.schema.json`;
    let response = null;
    try {
      response = await services.container.Http.request(uri);
    } catch (e) {
      // If it fails due to timeout/connectivity, or a server side issue - try again
      if (!e.statusCode || (e.statusCode >= 500 && e.statusCode <= 599)) {
        response = await services.container.Http.request(uri);
      } else if (e.statusCode < 400 || e.statusCode >= 500) {
        throw e;
      }
    }

    return JSON.parse(response);
  }

  static local(identifierPath) {
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      return require(`../../../json-schemas/${identifierPath}.schema.json`);
    } catch (e) {
      // The rest of the system will kick out an error due to an invalid schema.
      return null;
    }
  }
}

module.exports = { CVCSchemaLoader };
