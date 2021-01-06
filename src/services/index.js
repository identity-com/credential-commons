/**
 * Services IoC modules
 */
const Bottle = require('bottlejs');
const { CurrentCivicAnchor } = require('./DefaultAnchorServiceImpl.js');
const logger = require('../logger');
const HttpServiceConstructor = require('./httpService');
const config = require('./config');
const SecureRandom = require('../SecureRandom');
const MiniCryptoManagerImpl = require('./MiniCryptoManagerImpl');

const services = new Bottle();

/**
 * Init services with new values to config and http services
 * @param {*} conf
 * @param {*} http
 * @param secureRandom
 */
const initServices = (conf, http, secureRandom, cryptoManagerImpl) => {
  if (http) {
    services.resetProviders(['Http']);
    logger.debug('Registering custom HTTP service implementation');
    services.factory('Http', () => http);
  }
  if (conf) {
    services.resetProviders(['Config']);
    logger.debug('Registering custom Config service implementation');
    services.factory('Config', () => conf);
  }
  if (secureRandom) {
    services.resetProviders(['SecureRandom']);
    logger.debug('Registering custom SecureRandom service implementation');
    services.factory('SecureRandom', () => secureRandom);
  }
  if (cryptoManagerImpl) {
    services.resetProviders(['CryptoManager']);
    logger.debug('Registering custom CryptoManager service implementation');
    services.factory('CryptoManager', () => cryptoManagerImpl);
  }
  return services;
};

services.factory('Config', () => config);

logger.info('Registering request-promise-native as Http service implementation.');
services.service('Http', HttpServiceConstructor);

services.factory('SecureRandom', () => new SecureRandom());

services.service('AnchorService', CurrentCivicAnchor, 'Config', 'Http');

// The default CryptoManager Implementation
services.service('CryptoManager', MiniCryptoManagerImpl);

module.exports = { services, initServices };
