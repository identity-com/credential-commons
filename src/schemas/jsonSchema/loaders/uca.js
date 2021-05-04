const path = require('path');

const rootUri = 'http://identity.com/schemas/';

class UCASchemaLoader {
  constructor() {
    this.root = '/Users/william/Work/identity.com/credential-commons-master/schemas';
  }

  loadSchema(title) {
    const fullpath = path.join(this.root, 'uca', '1', `uca-${title}.schema.json`);

    // eslint-disable-next-line import/no-dynamic-require,global-require
    const schema = require(fullpath);

    return schema;
  }

  // eslint-disable-next-line class-methods-use-this
  valid(title) {
    return /^cvc:.*$/.test(title);
  }

  // eslint-disable-next-line class-methods-use-this
  schemaId(title) {
    return rootUri + title;
  }
}

module.exports = { UCASchemaLoader };
