'use strict';

/**
 * Request an JWT for the Authorization header
 * 
 * @param {*} http 
 * @param {*} requestBody 
 * @param {*} config 
 */
var getAuthHeader = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(http, requestBody, config) {
    var path, endpoint, clientConfig, jwt, options, authResponse, extension;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            path = '/jwt';
            endpoint = '' + config.sipSecurityService + path;
            clientConfig = config.clientConfig;

            logger.debug('clientConfig:', JSON.stringify(clientConfig, null, 2));
            jwt = jwtUtils.createToken(clientConfig.id, config.sipSecurityService, clientConfig.id, JWT_EXPIRATION, {
              method: 'GET',
              path: path
            }, clientConfig.signingKeys.hexsec);
            options = {
              url: endpoint,
              method: 'GET',
              headers: {
                Authorization: 'JWT ' + jwt
              },
              qs: {
                service: 'AttesterService',
                resource: config.attestationService + '/requestAttestation',
                method: 'POST'
              },
              json: true,
              simple: true // reject if not 2XX
            };
            _context.prev = 6;
            _context.next = 9;
            return http.request(options);

          case 9:
            authResponse = _context.sent;
            extension = getAuthHeaderExtension(http, requestBody, config);
            return _context.abrupt('return', Promise.resolve('Civic ' + authResponse.jwt + '.' + extension));

          case 14:
            _context.prev = 14;
            _context.t0 = _context['catch'](6);

            logger.error('Falied to get a Civic Authorization Header', _context.t0);
            return _context.abrupt('return', Promise.reject());

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[6, 14]]);
  }));

  return function getAuthHeader(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Register a new lib/client
 * 
 * @param {*} http 
 * @param {*} config 
 */


var registerClient = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(http, config) {
    var signingKeys, encryptionKeys, clientConfig, path, endpoint, jwt, body, options, registration;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            signingKeys = keyUtils.createKeys();
            encryptionKeys = keyUtils.createTempECDHKeys();
            clientConfig = {
              id: uniqueUtils.createClientID(uuid(), SecureRandom.wordWith(16)),
              signingKeys: keyUtils.serializeKeys(signingKeys),
              encryptionKeys: keyUtils.serializeKeys(encryptionKeys)
            };
            path = '/registry';
            endpoint = '' + config.sipSecurityService + path;

            logger.debug('clientConfig:', JSON.stringify(clientConfig, null, 2));
            jwt = jwtUtils.createToken(clientConfig.id, config.sipSecurityService, clientConfig.id, JWT_EXPIRATION, {
              method: 'POST',
              path: path
            }, clientConfig.signingKeys.hexsec);
            body = requestUtils.createRegistryObject(signingKeys.sec, clientConfig.id, clientConfig.signingKeys.hexpub, clientConfig.encryptionKeys.hexpub);
            options = {
              url: endpoint,
              method: 'POST',
              headers: {
                Authorization: 'JWT ' + jwt
              },
              body: body,
              json: true,
              simple: true // reject if not 2XX
            };
            _context2.prev = 9;

            logger.debug('Trying to register:', JSON.stringify(options, null, 2));

            _context2.next = 13;
            return http.request(options);

          case 13:
            registration = _context2.sent;

            logger.debug('Registration succesful:', JSON.stringify(registration, null, 2));
            _.unset(clientConfig, 'encryptionKeys');
            return _context2.abrupt('return', Promise.resolve(clientConfig));

          case 19:
            _context2.prev = 19;
            _context2.t0 = _context2['catch'](9);

            logger.error('Falied to register as a client', _context2.t0);
            return _context2.abrupt('return', Promise.reject());

          case 23:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[9, 19]]);
  }));

  return function registerClient(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Civic Anchor/Attester implementation
 * 
 * @param {*} config 
 * @param {*} http 
 */


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Current Civic Anchor/Attester service
 * 
 */
var _ = require('lodash');
var chainauth = require('chainauth');

var _require = require('civic-auth-utils'),
    keyUtils = _require.keyUtils,
    jwtUtils = _require.jwtUtils,
    uniqueUtils = _require.uniqueUtils,
    requestUtils = _require.requestUtils;

var SecureRandom = require('../SecureRandom');
var uuid = require('uuid/v4');
var logger = require('../logger');

var JWT_EXPIRATION = '3m';

/* eslint-disable no-unused-vars */
function getAuthHeaderExtension(http, requestBody, config) {
  /* eslint-enable-unused-vars */
  logger.warn('Attestation Service is not checking Civic JWT extension');
  return '';
}function CurrentCivicAnchor(config, http) {
  var _this = this;

  this.config = config;
  this.http = http;
  var pollService = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(statusUrl) {
      var attestation;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              _context3.next = 3;
              return _this.http.request({
                url: statusUrl,
                method: 'GET',
                simple: true,
                json: true
              });

            case 3:
              attestation = _context3.sent;

              if (!(!attestation || !attestation.type)) {
                _context3.next = 10;
                break;
              }

              _context3.next = 7;
              return pollService(statusUrl);

            case 7:
              return _context3.abrupt('return', _context3.sent);

            case 10:
              if (!(attestation && attestation.type !== 'permanent')) {
                _context3.next = 13;
                break;
              }

              attestation.statusUrl = statusUrl;
              return _context3.abrupt('return', attestation);

            case 13:
              return _context3.abrupt('return', attestation);

            case 16:
              _context3.prev = 16;
              _context3.t0 = _context3['catch'](0);

              logger.error('Error polling: ' + statusUrl, JSON.stringify(_context3.t0, null, 2));
              throw new Error('Error polling: ' + statusUrl);

            case 20:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this, [[0, 16]]);
    }));

    return function pollService(_x6) {
      return _ref3.apply(this, arguments);
    };
  }();

  this.anchor = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(label, data, options) {
      var opts, keychain, passphrase, network, attestationRequest, path, endpoint, authHeader, requestOptions, attestation;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              opts = options || {};
              keychain = opts.keychain || _this.config.keychain;
              passphrase = opts.passphrase || _this.config.passphrase;
              network = opts.network || _this.config.network || 'testnet';

              if (keychain) {
                _context4.next = 6;
                break;
              }

              throw new Error('Config Error, missing keychain.');

            case 6:
              if (passphrase) {
                _context4.next = 8;
                break;
              }

              throw new Error('Config Error, missing passphrase.');

            case 8:
              _context4.prev = 8;
              attestationRequest = chainauth.attestationRequest({
                keychain: keychain,
                passphrase: passphrase,
                network: network,
                label: label,
                data: data
              });
              path = '/requestAttestation';
              endpoint = '' + _this.config.attestationService + path;
              _context4.next = 14;
              return getAuthHeader(_this.http, attestationRequest, _this.config);

            case 14:
              authHeader = _context4.sent;
              requestOptions = {
                url: endpoint,
                headers: { Authorization: authHeader },
                body: attestationRequest,
                method: 'POST',
                json: true,
                simple: true // reject if not 2XX
              };
              _context4.next = 18;
              return _this.http.request(requestOptions);

            case 18:
              attestation = _context4.sent;

              if (attestation.type) {
                _context4.next = 23;
                break;
              }

              _context4.next = 22;
              return pollService('' + config.attestationService + attestation.statusUrl);

            case 22:
              attestation = _context4.sent;

            case 23:
              return _context4.abrupt('return', attestation);

            case 26:
              _context4.prev = 26;
              _context4.t0 = _context4['catch'](8);

              logger.error('Error requesting anchor', JSON.stringify(_context4.t0, null, 2));
              throw new Error('Error requesting anchor');

            case 30:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, _this, [[8, 26]]);
    }));

    return function (_x7, _x8, _x9) {
      return _ref4.apply(this, arguments);
    };
  }();

  this.update = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(tempAnchor) {
      var attestation;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              if (!(tempAnchor.type === 'temporary' && tempAnchor.statusUrl)) {
                _context5.next = 5;
                break;
              }

              _context5.next = 3;
              return pollService(tempAnchor.statusUrl);

            case 3:
              attestation = _context5.sent;
              return _context5.abrupt('return', attestation);

            case 5:
              throw new Error('Can\'t update the anchor. type:' + tempAnchor.type + ' statusUrl:' + tempAnchor.statusUrl);

            case 6:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this);
    }));

    return function (_x10) {
      return _ref5.apply(this, arguments);
    };
  }();
  return this;
}

module.exports = {
  registerClient: registerClient,
  CurrentCivicAnchor: CurrentCivicAnchor
};