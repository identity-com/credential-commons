'use strict';

const civicLog = require('civic-log');

const logger = civicLog({
  loggly: {
    level: 'debug',
    subdomain: 'civicteam',
    tags: []
  },
  dstream: {
    env: 'dev',
    region: 'us-east-1'
  }
});

module.exports = logger;