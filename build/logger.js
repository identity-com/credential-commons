'use strict';

var civicLog = require('civic-log');

var logger = civicLog({
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