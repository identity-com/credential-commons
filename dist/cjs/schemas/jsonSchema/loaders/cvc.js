'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  loadSchema(title) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const identifier = parseIdentifier(title);

      let schema = _this.local(identifier);

      if (schema === null) {
        schema = _this.remote(identifier);
      }

      return schema;
    })();
  }

  remote(identifier) {
    return _asyncToGenerator(function* () {
      const uri = `${BASE_URI}/${identifier[1]}/${identifier[4]}/${identifier[1]}-${identifier[2]}.schema.json`;
      let response = null;
      try {
        response = yield services.container.Http.request(uri);
      } catch (e) {
        if (!e.statusCode || e.statusCode >= 500 && e.statusCode <= 599) {
          response = yield services.container.Http.request(uri);
        } else if (e.statusCode < 400 || e.statusCode >= 500) {
          throw e;
        }

        return null;
      }

      return JSON.parse(response);
    })();
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