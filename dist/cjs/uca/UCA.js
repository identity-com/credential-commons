"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const {
  UserCollectableAttribute: BaseUCA
} = require('@identity.com/uca');

const {
  schemaLoader
} = require('../schemas/jsonSchema');

class UserCollectableAttribute extends BaseUCA {
  static create(identifier, value, version) {
    return _asyncToGenerator(function* () {
      yield schemaLoader.loadSchemaFromTitle(identifier);
      return new UserCollectableAttribute(identifier, value, version, schemaLoader.ucaDefinitions);
    })();
  }

}

module.exports = {
  UserCollectableAttribute
};