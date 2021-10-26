"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const fs = require('fs');

const {
  parseIdentifier
} = require('../../../lib/stringUtils');

const {
  services
} = require('../../../services');

const rootUri = 'http://identity.com/schemas/';
const DEFAULT_SCHEMA_PATH = 'http://dev-schemas.civic.com.s3-website-us-east-1.amazonaws.com/dev';

class FSSchemaCache {
  constructor(cachePath = './.tmp/schemas') {
    this.cachePath = cachePath;
    fs.mkdirSync(cachePath, {
      recursive: true
    });
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

const getIdentifierPath = identifier => {
  let identifierPath;

  if (/^cvc:.*$/.test(identifier)) {
    identifierPath = `uca/1/${identifier}`;
  } else {
    const parsedIdentifier = parseIdentifier(identifier);

    if (parsedIdentifier) {
      identifierPath = `${parsedIdentifier[1]}/${parsedIdentifier[4]}/${parsedIdentifier[2]}`;
    }
  }

  return identifierPath;
};
/**
 * This is a sample schema loader, to be used for testing or civic.com claims & credential implementations
 */


class CVCLoader {
  constructor(http = services.container.Http, cache = new FSSchemaCache(), schemaPath = DEFAULT_SCHEMA_PATH) {
    this.http = http;
    this.cache = cache;
    this.schemaPath = schemaPath;
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


  loadSchema(identifier) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let schema = null;

      if (_this.cache) {
        schema = _this.cache.get(identifier);
      } // Only load the schema remotely if a base url was provided and none was found locally


      if (!schema) {
        schema = yield _this.remote(identifier);

        if (_this.cache && schema) {
          _this.cache.set(identifier, schema);
        }
      }

      return !schema ? null : JSON.parse(schema);
    })();
  }
  /**
   * Loads a schema from a remote location
   * @param identifier The identifer to load the schema for
   * @returns The schema object if found
   */


  remote(identifier) {
    var _this2 = this;

    return _asyncToGenerator(function* () {
      const identifierPath = getIdentifierPath(identifier);

      if (!identifierPath) {
        return null;
      }

      const uri = `${_this2.schemaPath}/${identifierPath}.schema.json`;
      let response = null;

      try {
        response = yield _this2.http.request(uri);
      } catch (e) {
        // If it fails due to timeout/connectivity, or a server side issue - try again
        if (!e.statusCode || e.statusCode >= 500 && e.statusCode <= 599) {
          response = yield services.container.Http.request(uri);
        } else if (e.statusCode < 400 || e.statusCode >= 500) {
          throw e;
        }
      }

      return response;
    })();
  }

}

module.exports = CVCLoader;