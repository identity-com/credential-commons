/**
 * A simple node HTTP services
 */
const request = require('request-promise-native');
// uncloment to debug requests
// require('request-debug')(request);

function HttpServiceConstructor() {
  this.request = async (uri, options) => {
    const response = await request(uri, options);
    return response;
  };
  return this;
}


module.exports = HttpServiceConstructor;
