'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const rootUri = 'http://identity.com/schemas/';

class UCASchemaLoader {
  loadSchema(title) {
    var _this = this;

    return _asyncToGenerator(function* () {
      return _this.local(title);
    })();
  }

  local(title) {
    try {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      return require(`../../../json-schemas/uca/1/uca-${title}.schema.json`);
    } catch (e) {
      return null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  valid(title) {
    return (/^cvc:.*$/.test(title)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  schemaId(title) {
    return rootUri + title;
  }
}

module.exports = { UCASchemaLoader };