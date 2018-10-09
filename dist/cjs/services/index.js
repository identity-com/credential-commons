'use strict';

/**
 * Services IoC modules
 */
const Bottle = require('bottlejs');
const { CurrentCivicAnchor } = require('./DummyAnchorServiceImpl.js');
const AnchorService = require('./anchorService');
const logger = require('../logger');
const HttpServiceConstructor = require('./httpService');
const config = require('./config');

const services = new Bottle();

/**
 * Init services with new values to config and http services
 * @param {*} conf 
 * @param {*} http 
 */
const initServices = (conf, http) => {
  if (http) {
    services.resetProviders(['Http']);
    logger.debug('Registering custom HTTP service implementation');
    services.factory('Http', () => http);
  }
  if (conf) {
    services.resetProviders(['Http']);
    logger.debug('Registering custom Config service implementation');
    services.factory('Config', () => conf);
  }

  return services;
};

services.factory('Config', () => config);

logger.info('Registering request-promise-native as Http service implementation.');
services.service('Http', HttpServiceConstructor);

services.service('CivicAnchor', CurrentCivicAnchor, 'Config', 'Http');

services.factory('AnchorService', container => {
  // Here we can execute logic to replace the implementation
  const civicAnchor = container.CivicAnchor;
  logger.debug('Registering AnchorService with Civic implementation');
  return new AnchorService(civicAnchor);
});

module.exports = { services, initServices };