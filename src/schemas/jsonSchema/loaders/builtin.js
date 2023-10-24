const { definitions } = require("@identity.com/uca");

const getDefinition = (identifier) => {
  const foundDefinition = definitions.find((d) => d.identifier === identifier);
  if (!foundDefinition)
    throw new Error(`Definition not found for ${identifier}`);
  return {
    title: foundDefinition.identifier,
    ...foundDefinition,
  };
};
/**
 * Loads schemas that the credential-commons library cannot do without.
 */
class BuiltinSchemaLoader {
  constructor() {
    this.schemas = {
      "cvc:Random:node": getDefinition("cvc:Random:node"),
    };
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

module.exports = { BuiltinSchemaLoader };
