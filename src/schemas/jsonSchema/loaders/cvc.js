const fs = require('fs');
const { parseIdentifier } = require('../../../lib/stringUtils');
const { services } = require('../../../services');

const rootUri = 'http://identity.com/schemas/';
const DEFAULT_SCHEMA_PATH = 'http://test-schemas.civic.com.s3-website-us-east-1.amazonaws.com';

class FSSchemaCache {
  constructor(cachePath = './.tmp/schemas') {
    this.cachePath = cachePath;
    fs.mkdirSync(cachePath, { recursive: true });
  }

  get(identifier) {
    const cachePath = `${this.cachePath}/${identifier}.schema.json`;
    if (!fs.existsSync(cachePath)) {
      return null;
    }

    return fs.readFileSync(cachePath);
  }

  set(identifier, schema) {
    const cachePath = `${this.cachePath}/${identifier}.schema.json`;

    fs.writeFileSync(cachePath, schema);
  }
}

const getIdentifierPath = (identifier) => {
  let identifierPath;

  if (/^cvc:.*$/.test(identifier)) {
    identifierPath = `uca/1/${identifier}`;
  } else {
    const parsedIdentifier = parseIdentifier(identifier);

    identifierPath = `${parsedIdentifier[1]}/${parsedIdentifier[4]}/${parsedIdentifier[2]}`;
  }

  return identifierPath;
};

/**
 * This is a sample schema loader, to be used for testing or civic.com claims & credential implementations
 */
class CVCLoader {
  constructor(http = services.container.Http, cache) {
    this.http = http;
    this.cache = cache === undefined ? new FSSchemaCache() : null;
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
    let schema = null;
    if (this.cache !== null) {
      schema = this.cache.get(identifier);
    }

    // Only load the schema remotely if a base url was provided and none was found locally
    if (schema === null) {
      schema = await this.remote(identifier);

      if (this.cache !== null) {
        this.cache.set(identifier, schema);
      }
    }

    return JSON.parse(schema);
  }

  /**
   * Loads a schema from a remote location
   * @param identifier The identifer to load the schema for
   * @returns The schema object if found
   */
  async remote(identifier) {
    const identifierPath = getIdentifierPath(identifier);

    const uri = `${DEFAULT_SCHEMA_PATH}/${identifierPath}.schema.json`;

    let response = null;
    try {
      response = await this.http.request(uri);
    } catch (e) {
      // If it fails due to timeout/connectivity, or a server side issue - try again
      if (!e.statusCode || (e.statusCode >= 500 && e.statusCode <= 599)) {
        response = await services.container.Http.request(uri);
      } else if (e.statusCode < 400 || e.statusCode >= 500) {
        throw e;
      }
    }

    return response;
  }
}

module.exports = CVCLoader;
