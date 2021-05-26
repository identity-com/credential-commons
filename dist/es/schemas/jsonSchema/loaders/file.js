const path = require('path');

const { parseIdentifier } = require('../../../lib/stringUtils');

class FileSchemaLoader {
  constructor(root) {
    this.root = root;
  }

  loadSchema(title) {
    const identifier = parseIdentifier(title);

    const fullpath = path.join(this.root, identifier[1], identifier[4], `${identifier[1]}-${identifier[2]}.schema.json`);

    // eslint-disable-next-line global-require,import/no-dynamic-require
    return require(fullpath);
  }
}

module.exports = { FileSchemaLoader };