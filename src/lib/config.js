import civicLog from 'civic-log';

const logger = civicLog(
  {
    loggly: {
      level: 'debug',
      subdomain: 'civicteam',
      tags: [],
    },
    dstream: {
      env: 'dev',
      region: 'us-east-1',
    },
  },
);

export default logger;
