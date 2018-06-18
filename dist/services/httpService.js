'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * A simple node HTTP services
 */
const request = require('request-promise-native');
// uncloment to debug requests
// require('request-debug')(request);

function HttpServiceConstructor() {
  this.request = (() => {
    var _ref = _asyncToGenerator(function* (uri, options) {
      const response = yield request(uri, options);
      return response;
    });

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  })();
  return this;
}

module.exports = HttpServiceConstructor;