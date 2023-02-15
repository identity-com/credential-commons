// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * Services IoC modules
 */
import Bottle from 'bottlejs'
import {config} from './config'
import {CurrentCivicAnchor} from './DefaultAnchorServiceImpl';
import logger from '../logger';
import {HttpServiceConstructor} from './httpService';
import SecureRandom from '../SecureRandom';
import MiniCryptoManagerImpl from './MiniCryptoManagerImpl';

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

export = {services, initServices};
