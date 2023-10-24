class SimpleSchemaLoader {
  constructor(schemas) {
    this.schemas = schemas;
  }

  loadSchema(identifier) {
    return this.schemas[identifier];
  }

  valid(identifier) {
    return !!this.schemas[identifier];
  }

  // eslint-disable-next-line class-methods-use-this
  schemaId(identifier) {
    return `http://identity.com/schemas/${identifier}`;
  }
}

module.exports = { SimpleSchemaLoader };
