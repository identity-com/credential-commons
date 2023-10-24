const { UserCollectableAttribute: BaseUCA } = require("@identity.com/uca");
const { schemaLoader } = require("../schemas/jsonSchema");

class UserCollectableAttribute extends BaseUCA {
  static async create(identifier, value, version) {
    await schemaLoader.loadSchemaFromTitle(identifier);

    return new UserCollectableAttribute(
      identifier,
      value,
      version,
      schemaLoader.ucaDefinitions,
    );
  }
}

module.exports = { UserCollectableAttribute };
