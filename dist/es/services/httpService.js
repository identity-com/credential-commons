/**
 * A simple node HTTP services
 */
const request = require('request-promise-native'); // uncomment to debug requests
// require('request-debug')(request);


function HttpServiceConstructor() {
  this.request = async (uri, options) => {
    try {
      const response = await request(uri, options);
      return response;
    } catch (e) {
      return null;
    }
  };

  return this;
}

module.exports = HttpServiceConstructor;