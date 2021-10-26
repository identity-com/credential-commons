const BrowserConsole = require('winston-transport-browserconsole').default;

const { createLogger, format } = require('winston');

// Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
const logger = createLogger({
  // To see more detailed errors, change this to 'debug'
  level: 'info',
  format: format.combine(
    format.splat(),
    format.simple(),
  ),
  transports: [
    new BrowserConsole(),
  ],
});

module.exports = logger;
