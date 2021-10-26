// const BrowserConsole = require('winston-transport-browserconsole').default;
//
// const { createLogger, format } = require('winston');
//
// // Configure the Winston logger. For the complete documentation see https://github.com/winstonjs/winston
// const logger = createLogger({
//   // To see more detailed errors, change this to 'debug'
//   level: 'info',
//   format: format.combine(
//     format.splat(),
//     format.simple(),
//   ),
//   transports: [
//     new BrowserConsole(),
//   ],
// });
module.exports = {
  // eslint-disable-next-line no-unused-vars
  warn(a, b = undefined) {},

  // eslint-disable-next-line no-unused-vars
  info(a, b = undefined) {},

  // eslint-disable-next-line no-unused-vars
  debug(a, b = undefined) {},

  // eslint-disable-next-line no-unused-vars
  error(a, b = undefined) {}

};