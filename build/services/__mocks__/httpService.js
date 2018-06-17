'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var logger = require('../../logger');
var _ = require('lodash');

function HttpServiceConstructor() {
  var _this = this;

  this.name = 'mockHttp';
  this.request = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(uri, options) {
      var params, responses, res;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              logger.debug('Mocking request for: ' + JSON.stringify({ uri: uri, options: options }, null, 2));
              params = _.isString(uri) ? { url: uri } : uri;

              _.assign(params, options);
              responses = [{
                path: '/registry',
                response: { clientID: '6e0ce9330f22df6fb4cbcc0dbb31eb13064a194c1482ed3d9debf3169dc2325b',
                  xpub: '048751f53a2e4c235ecf0e469919359510a703516503299c77e5df9f8a70500f18255a32db19a3e69636e203f25f29be24b680fbdc82d0783bd30e315ebfd6bd1e',
                  cas: '{"iv":"TEtgZuJdyJFkgcuHoBC52w==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","salt":"SA0z5h6IlfA=","ct":"8h6ys3fD31HsWH3s5rrbF6o54ekJf6owhSJBW6FBIhkftJWSWVWVEt0u0FJFqhCqPaEl+DMM6olH9fAcB7bD7i2DRPjLYiC+"}',
                  sak: {} }
              }, {
                path: '/jwt',
                response: { jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiIyYzdlNjQ4YS1hNDhmLTQxNTgtOGZmMS02MTY0YzM5OWNlNDMiLCJpYXQiOjE1Mjg4MjE1ODUuNDM0LCJleHAiOjE1Mjg4MjE3NjUuNDM0LCJpc3MiOiJodHRwczovL2FwaS5jaXZpYy5jb20vand0IiwiYXVkIjoiQXR0ZXN0ZXJTZXJ2aWNlIiwic3ViIjoiYzhhNjRhODE4NWRlMzNkMTlkZTgwMjFmYmUyMjhkMmE1YTc3YzExMTdkYjc1NDJlZDE0ODM1NGNiZjdkNGVmMSIsImRhdGEiOnsibWV0aG9kIjoiUE9TVCIsInBhdGgiOiJodHRwczovL2Rldi5hcGkuY2l2aWMuY29tL3JlcXVlc3QtYXR0ZXN0YXRpb24tdGJjaC9yZXF1ZXN0QXR0ZXN0YXRpb24ifX0.2Rp8XLTLvzu51raTQRpce8kIiilsMeiPZeWAsuNv5n7hFZGl-ce-fx9DgxsZ0OTaIUgo8frbiGmHjQh0WlUG7A' }
              }, {
                path: '/requestAttestation',
                response: { statusUrl: '/status/372091f0-6e5f-11e8-ab04-8d6f9c9b4e5a' }
              }, {
                path: '/requestAttestation',
                response: { statusUrl: '/status/372091f0-6e5f-11e8-ab04-8d6f9c9b4e5a' }
              }, {
                path: '/status',
                response: {
                  schema: 'tbch-20180201',
                  tx: '01000000018815822815dbd6c355ad40da1f2fac328a408d538638143177168b57af5d753a00000000fc004730440220424268275da66825bc99a3f487472baa0751b67355407b4a4e99da04a3186c520220578b820dd051c919c2fb57b26aa29667483b547f6766a23e3c821e47a5d1237b0147304402201316cc0ee8a968f4d86a616fcf710b663e0bb7021e95d7a300036b65e95ca34602204f05162db06278af2a8abdd7ab4d92e973dc4154a92bf37a4056f3298fa9ecad014c695221028f9205846d9b23dd9a17588ae13603aa3eda3599582750904716c827d02269db210340f8f56a56b2af2a9698f66574882068cf8bd8fa95a26136ac34edabfe5eb5d021029d52d336232eb3d4f37730822df9d3993a84c3edba20f14d3ee0f20141c0bdfd53aeffffffff01551500000000000017a91460312cbbb8ec560305a239d56398f0d8aa57ecf68700000000',
                  subject: {
                    label: 'teste',
                    pub: 'xpub661MyMwAqRbcFNXRK7kdsoidhiyfqiwhVhbphdKZjqnik83L1w1mWsPwVrsvbRrPa7sysiJRRBxr6jyrCbPScdXkhSjyYtQtFfwxGBwrBzn',
                    data: 'testesdsd',
                    signature: '304502210089e94f11587bf7fa202817ace9664639855a146565d4e54b9f853f31f4d7ce31022077098a904e0dda7ab947db92a3e7dd7a5d52654c286151c3cc97feb0ef4a3310'
                  },
                  authority: {
                    pub: 'xpub661MyMwAqRbcGYsJt9oHuATcFJT277ajoJdwFsM23mxumR6xU4dvDRyNFE35Mshe1poDBwsiKAAuG2ayGq7rwUuzz1JS5at56MAzfVyBtud',
                    path: '/1/0/0/0'
                  },
                  cosigners: [{
                    pub: 'xpub661MyMwAqRbcGYsJt9oHuATcFJT277ajoJdwFsM23mxumR6xU4dvDRyNFE35Mshe1poDBwsiKAAuG2ayGq7rwUuzz1JS5at56MAzfVyBtud'
                  }, {
                    pub: 'xpub661MyMwAqRbcH2jTK8JmQg1zDFXdZviL2bgFQDj16oWBJYcjXWGuLjBNnv4SrtjuvdVj2w8AK5AHL8ZDaNuqMtmL6TCRSxP4EsHnu1dbfcb'
                  }],
                  type: 'temporary',
                  network: 'testnet'
                }

              }];
              res = _.find(responses, function (r) {
                return _.includes(params.url, r.path);
              });

              if (!res) {
                _context.next = 7;
                break;
              }

              return _context.abrupt('return', Promise.resolve(res.response));

            case 7:
              return _context.abrupt('return', Promise.reject());

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  return this;
}

logger.debug('Using Mock HTTP Service');
var http = new HttpServiceConstructor();
http.request('/status').then(console.log);
logger.debug('HTTP Service instance ' + JSON.stringify(http, null, 2));

module.exports = http;