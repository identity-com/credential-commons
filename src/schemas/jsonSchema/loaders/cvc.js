const { FileSchemaLoader } = require('./file');

const rootUri = 'http://identity.com/schemas/';

class CVCSchemaLoader extends FileSchemaLoader {
  constructor() {
    // TODO: Find relative path
    super('/Users/william/Work/identity.com/credential-commons-master/schemas');
  }

  // eslint-disable-next-line class-methods-use-this
  schemaId(title) {
    return rootUri + title;
  }

  // eslint-disable-next-line class-methods-use-this
  valid(title) {
    return /^(claim|credential|type)-cvc:.*$/.test(title);
  }
}

module.exports = { CVCSchemaLoader };
