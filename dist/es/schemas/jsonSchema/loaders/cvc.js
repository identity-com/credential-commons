const path = require('path');
const { parseIdentifier } = require('../../../lib/stringUtils');
const { services } = require('../../../services');

const rootUri = 'http://identity.com/schemas/';
const BASE_URI = 'http://localhost:7500';

class CVCSchemaLoader {
  // eslint-disable-next-line class-methods-use-this
  schemaId(title) {
    return rootUri + title;
  }

  // eslint-disable-next-line class-methods-use-this
  valid(title) {
    return (/^(claim|credential|type)-(cvc|alt):.*$/.test(title)
    );
  }

  async loadSchema(title) {
    const identifier = parseIdentifier(title);

    let schema = this.local(identifier);

    if (schema === null) {
      schema = this.remote(identifier);
    }

    return schema;
  }

  async remote(identifier) {
    const uri = `${BASE_URI}/${identifier[1]}/${identifier[4]}/${identifier[1]}-${identifier[2]}.schema.json`;
    let response = null;
    try {
      response = await services.container.Http.request(uri);
    } catch (e) {
      if (!e.statusCode || e.statusCode >= 500 && e.statusCode <= 599) {
        response = await services.container.Http.request(uri);
      } else if (e.statusCode < 400 || e.statusCode >= 500) {
        throw e;
      }

      return null;
    }

    return JSON.parse(response);
  }

  // eslint-disable-next-line class-methods-use-this
  local(identifier) {
    return null;
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      return require(`../../../json-schemas/${identifier[1]}/${identifier[4]}/${identifier[1]}-${identifier[2]}.schema.json`);
    } catch (e) {
      return null;
    }
  }
}

module.exports = { CVCSchemaLoader };