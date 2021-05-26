const rootUri = 'http://identity.com/schemas/';

class UCASchemaLoader {
  async loadSchema(title) {
    return this.local(title);
  }

  local(title) {
    try {
      // eslint-disable-next-line import/no-dynamic-require,global-require
      return require(`../../../json-schemas/uca/1/uca-${title}.schema.json`);
    } catch (e) {
      return null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  valid(title) {
    return (/^cvc:.*$/.test(title)
    );
  }

  // eslint-disable-next-line class-methods-use-this
  schemaId(title) {
    return rootUri + title;
  }
}

module.exports = { UCASchemaLoader };