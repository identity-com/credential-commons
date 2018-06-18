'use strict';

/**
 * Services IoC modules
 */
var Bottle = require('bottlejs');

var _require = require('./CurrentCivicAnchorServiceImpl'),
    CurrentCivicAnchor = _require.CurrentCivicAnchor;

var AnchorService = require('./anchorService');
var logger = require('../logger');
var HttpServiceConstructor = require('./httpService');
var config = require('./config');

var services = new Bottle();

/**
 * Init services with new values to config and http services
 * @param {*} conf 
 * @param {*} http 
 */
var initServices = function initServices(conf, http) {
  if (http) {
    services.resetProviders(['Http']);
    logger.debug('Registering custom HTTP service implementation');
    services.factory('Http', function () {
      return http;
    });
  }
  if (conf) {
    services.resetProviders(['Http']);
    logger.debug('Registering custom Config service implementation');
    services.factory('Config', function () {
      return http;
    });
  }

  return services;
};

services.factory('Config', function () {
  return config;
});

logger.info('Registering request-promise-native as Http service implementation.');
services.service('Http', HttpServiceConstructor);

services.service('CivicAnchor', CurrentCivicAnchor, 'Config', 'Http');

services.factory('AnchorService', function (container) {
  // Here we can execute logic to replace the implementation
  var civicAnchor = container.CivicAnchor;
  // logger.debug('Registering AnchorService with Civic implementation');
  return new AnchorService(civicAnchor);
});

module.exports = { services: services, initServices: initServices };