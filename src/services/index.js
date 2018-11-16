/**
 * Services IoC modules
 */
const Bottle = require('bottlejs');
const { CurrentCivicAnchor } = require('./DummyAnchorServiceImpl.js');
const logger = require('../logger');
const HttpServiceConstructor = require('./httpService');
const config = require('./config');
const SecureRandom = require('../SecureRandom');

const services = new Bottle();

/**
 * Init services with new values to config and http services
 * @param {*} conf
 * @param {*} http
 * @param secureRandom
 */
const initServices = (conf, http, secureRandom) => {
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
  return services;
};

services.factory('Config', () => config);

logger.info('Registering request-promise-native as Http service implementation.');
services.service('Http', HttpServiceConstructor);

services.service('SecureRandom', SecureRandom);

services.service('AnchorService', CurrentCivicAnchor, 'Config', 'Http');

module.exports = { services, initServices };
