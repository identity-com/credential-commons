const fs = require('fs');
const { parseIdentifier } = require('../src/lib/stringUtils');
const { services } = require('../src/services');

const rootUri = 'http://identity.com/schemas/';

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

class TestCVCLoader {
  constructor(baseRemoteUri = 'http://test-schemas.civic.com.s3-website-us-east-1.amazonaws.com') {
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
    let schema = TestCVCLoader.local(identifier);

    // Only load the schema remotely if a base url was provided and none was found locally
    if (this.baseRemoteUri && schema === null) {
      schema = await this.remote(identifier);
    }

    return schema;
  }

  /**
   * Loads a schema from a remote location
   * @param identifier The identitifer to load the schema for
   * @returns The schema object if found
   */
  async remote(identifier) {
    const identifierPath = getIdentifierPath(identifier);

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


    const schema = JSON.parse(response);

    if (response !== null) {
      TestCVCLoader.store(identifier, response);
    }

    return schema;
  }

  /**
   * Checks to see if a locally stored copy of the schema exists, and returns that.
   * @param identifier The identifier to load the schema for
   * @returns The schema found locally
   */
  static local(identifier) {
    const cachePath = TestCVCLoader.cachePath(identifier);

    if (!fs.existsSync(cachePath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(cachePath));
  }

  /**
   * Stores a local copy of the schema
   * @param identifier The identifier to store the schema for
   * @param schema The schema object (as a string) to store
   */
  static store(identifier, schema) {
    fs.writeFileSync(TestCVCLoader.cachePath(identifier), schema);
  }

  /**
   * Gets the cache path for the identifier
   * @param identifier The identifier to get the cache path for
   * @returns {string} The path where the file is stored
   */

  static cachePath(identifier) {
    fs.mkdirSync('./.tmp/schemas', { recursive: true });

    return `./.tmp/schemas/${identifier}.json.schema`;
  }
}

module.exports = TestCVCLoader;
