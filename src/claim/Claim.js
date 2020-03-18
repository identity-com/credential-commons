const _ = require('lodash');
const sjcl = require('sjcl');
const { UserCollectableAttribute } = require('@identity.com/uca');
const definitions = require('./definitions');
const { services } = require('../services');

const validIdentifiers = _.map(definitions, d => d.identifier);

const getDefinition = (identifier, version) => (
  version ? _.find(definitions, { identifier, version }) : _.find(definitions, { identifier })
);

function getBaseIdentifiers(identifier) {
  const claimRegex = /claim-cvc:(.*)\.(.*)-v\d*/;
  let isNewIdentifier = true;

  let identifierComponents = claimRegex.exec(identifier);
  if (identifierComponents === null) {
    identifierComponents = _.split(identifier, ':');
    isNewIdentifier = false;
  }
  return { identifierComponents, isNewIdentifier };
}

function adaptIdentifierIfNeeded(identifier, version) {
  const definition = getDefinition(identifier, version);
  const resolvedIdentifier = (definition && definition.alias) ? definition.type : identifier;

  const { isNewIdentifier, identifierComponents } = getBaseIdentifiers(resolvedIdentifier);

  if (!isNewIdentifier && !getDefinition(resolvedIdentifier, version)) {
    const newIdentifier = `claim-cvc:${identifierComponents[1]}.${identifierComponents[2]}-v1`;
    const foundNewIdentifier = _.find(definitions, { identifier: newIdentifier });
    if (foundNewIdentifier) {
      return newIdentifier;
    }
    throw new Error(`${resolvedIdentifier} is not defined`);
  }
  return identifier;
}

class Claim extends UserCollectableAttribute {
  constructor(identifier, value, version) {
    const currentIdentifier = adaptIdentifierIfNeeded(identifier, version);
    super(currentIdentifier, value, version, definitions);
    this.initialize(currentIdentifier, value, version);
  }

  initialize(identifier, value, version) {
    super.initialize(identifier, value, version);
    if (!this.salt) {
      const secureRandom = services.container.SecureRandom;
      this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(secureRandom.wordWith(64)));
    }
  }

  initializeAttestableValue() {
    const { value } = this;
    const definition = getDefinition(this.identifier, this.version);

    // Trying to construct UCA with a existing attestableValue
    const parsedAttestableValue = Claim.parseAttestableValue(value);
    if (parsedAttestableValue.length === 1) {
      // This is a simple attestableValue
      this.timestamp = null;
      this.salt = parsedAttestableValue[0].salt;
      const ucaValue = parsedAttestableValue[0].value;
      this.value = _.includes(['null', 'undefined'], ucaValue) ? null : ucaValue;
    } else {
      const ucaValue = {};
      for (let i = 0; i < parsedAttestableValue.length; i += 1) {
        const { propertyName } = parsedAttestableValue[i];
        // we have stored only the property name on the urn, so we have to find the UCA definition

        let filteredIdentifier;
        let ucaPropertyName;
        const ucaType = UserCollectableAttribute.resolveType(definition, definitions);
        const ucaDef = ucaType.properties.find(prop => prop.name === propertyName);
        if (ucaDef) {
          filteredIdentifier = ucaDef.type;
          ucaPropertyName = propertyName;
        } else {
          const splitPropertyName = propertyName.split('.');
          // this property is used to check if the recursion tree has more than an depth
          const ucaNamespace = splitPropertyName[splitPropertyName.length - 2];
          const ucaNamespacePascal = ucaNamespace.substring(0, 1).toUpperCase() + ucaNamespace.substring(1);
          ucaPropertyName = splitPropertyName[splitPropertyName.length - 1];
          filteredIdentifier = `cvc:${ucaNamespacePascal}:${ucaPropertyName}`;
        }

        // test if definition exists
        const filteredDefinition = definitions.find(def => def.identifier === filteredIdentifier);
        if (!filteredDefinition) {
          // this must have an claim path with no recursive definition
          filteredIdentifier = this.findDefinitionByAttestableValue(ucaPropertyName, definition);
        }
        ucaValue[propertyName] = new Claim(filteredIdentifier,
          { attestableValue: parsedAttestableValue[i].stringValue });
      }
      this.value = ucaValue;
    }
  }

  /* eslint-disable class-methods-use-this */
  getValidIdentifiers() {
    return validIdentifiers;
  }

  static resolveType(definition) {
    return UserCollectableAttribute.resolveType(definition, definitions);
  }

  static parseAttestableValue(value) {
    const values = [];
    const splitPipes = _.split(value.attestableValue, '|');
    const attestableValueRegex = /^urn:(\w+(?:\.\w+)*):(\w+):(.+)/;
    _.each(splitPipes, (stringValue) => {
      const match = attestableValueRegex.exec(stringValue);
      if (match && match.length === 4) {
        const v = {
          propertyName: match[1],
          salt: match[2],
          value: match[3],
          stringValue,
        };
        values.push(v);
      }
    });
    if (splitPipes.length !== values.length && splitPipes.length !== values.length + 1) {
      throw new Error('Invalid attestableValue');
    }
    return values;
  }

  findDefinitionByAttestableValue(attestableValuePropertyName, rootDefinition) {
    const ucaType = UserCollectableAttribute.resolveType(rootDefinition, definitions);
    for (const property of ucaType.properties) { // eslint-disable-line no-restricted-syntax
      const resolvedDefinition = _.find(definitions, { identifier: property.type });
      resolvedDefinition.type = UserCollectableAttribute.resolveType(resolvedDefinition, definitions);
      if (!resolvedDefinition.type.properties && property.name === attestableValuePropertyName) {
        return property.type;
      }
      if (resolvedDefinition.type.properties) {
        return this.findDefinitionByAttestableValue(attestableValuePropertyName, resolvedDefinition);
      }
    }
    return null;
  }

  getAttestableValue(path) {
    // all UCA properties they have the form of :propertyName or :something.propertyName
    const { identifierComponents } = getBaseIdentifiers(this.identifier);
    let propertyName = identifierComponents[2];
    if (path) {
      propertyName = `${path}.${propertyName}`;
    }

    // it was defined that the attestable value would be on the URN type https://tools.ietf.org/html/rfc8141
    if (['String', 'Number', 'Boolean'].indexOf(this.type) >= 0) {
      return `urn:${propertyName}:${this.salt}:${this.value}|`;
    }
    return _.reduce(_.sortBy(_.keys(this.value)),
      (s, k) => `${s}${this.value[k].getAttestableValue(propertyName)}`, '');
  }

  /**
   * Returns the global CredentialItem of the Credential
   */
  getGlobalIdentifier() {
    return `claim-${this.identifier}-${this.version}`;
  }

  getClaimRootPropertyName() {
    const { identifierComponents } = getBaseIdentifiers(this.identifier);
    return _.camelCase(identifierComponents[1]);
  }

  getClaimPropertyName() {
    const { identifierComponents } = getBaseIdentifiers(this.identifier);
    return identifierComponents[2];
  }

  getClaimPath() {
    return Claim.getPath(this.identifier);
  }

  static getPath(identifier) {
    const { identifierComponents } = getBaseIdentifiers(identifier);
    const baseName = _.camelCase(identifierComponents[1]);
    return `${baseName}.${identifierComponents[2]}`;
  }

  getAttestableValues() {
    const values = [];
    const def = _.find(definitions, { identifier: this.identifier, version: this.version });
    if (def.credentialItem || def.attestable) {
      values.push({ identifier: this.identifier, value: this.getAttestableValue() });
      if (this.type === 'Object') {
        _.forEach(_.keys(this.value), (k) => {
          const innerValues = this.value[k].getAttestableValues();
          _.reduce(innerValues, (res, iv) => res.push(iv), values);
        });
      }
    }
    return values;
  }

  /**
   * extract the expected Type name for the value when constructing an UCA
   * @param {*} definition
   */
  static getTypeName(definition) {
    if (_.isString(definition.type)) {
      if (_.includes(validIdentifiers, definition.type)) {
        const innerDefinition = _.find(definitions, { identifier: definition.type });
        return this.getTypeName(innerDefinition);
      }

      return definition.type;
    }
    return 'Object';
  }

  static getAllProperties(identifier, pathName) {
    const definition = _.find(definitions, { identifier });
    const properties = [];
    const type = UserCollectableAttribute.resolveType(definition, definitions);
    const typeDefinition = _.isString(type) ? _.find(definitions, { identifier: type }) : definition;

    if (typeDefinition && this.getTypeName(typeDefinition) === 'Object') {
      let typeDefProps;
      if (typeDefinition.type.properties) {
        typeDefProps = typeDefinition.type.properties;
      } else {
        const typeDefDefinition = _.find(definitions, { identifier: typeDefinition.type });
        typeDefProps = UserCollectableAttribute.resolveType(typeDefDefinition, definitions).properties;
      }

      let basePropName;
      const { identifierComponents: baseIdentifierComponents } = getBaseIdentifiers(identifier);
      if (pathName) {
        if (_.includes(pathName, _.lowerCase(baseIdentifierComponents[1]))) {
          basePropName = `${pathName}`;
        } else {
          basePropName = `${pathName}.${_.lowerCase(baseIdentifierComponents[1])}.${baseIdentifierComponents[2]}`;
        }
      } else {
        basePropName = `${_.lowerCase(baseIdentifierComponents[1])}.${baseIdentifierComponents[2]}`;
      }

      if (_.includes(['String', 'Number', 'Boolean'], `${typeDefProps.type}`)) {
        // Properties is not an object
        properties.push(`${basePropName}.${typeDefProps.name}`);
      } else {
        _.forEach(typeDefProps, (prop) => {
          const { isNewIdentifier } = getBaseIdentifiers(prop.type);
          const newBasePropName = !isNewIdentifier ? basePropName : `${basePropName}.${prop.name}`;
          const proProperties = this.getAllProperties(prop.type, newBasePropName);
          _.forEach(proProperties, p => properties.push(p));
        });
      }
    } else if (pathName) {
      const { identifierComponents } = getBaseIdentifiers(definition.identifier);
      let propertiesName;
      if (pathName.indexOf(identifierComponents[2]) >= 0) {
        propertiesName = `${pathName}`;
      } else {
        propertiesName = `${pathName}.${identifierComponents[2]}`;
      }
      properties.push(propertiesName);
    } else {
      const { identifierComponents } = getBaseIdentifiers(identifier);
      const propertiesName = `${_.lowerCase(identifierComponents[1])}.${identifierComponents[2]}`;
      properties.push(propertiesName);
    }
    return properties;
  }
}

function convertIdentifierToClassName(identifier) {
  const { identifierComponents } = getBaseIdentifiers(identifier);
  const baseName = identifierComponents[1];
  const detailName = _.upperFirst(_.camelCase(identifierComponents[2]));
  return `${baseName}${detailName}`;
}

function mixinIdentifiers(UCA) {
  // Extend UCA Semantic
  _.forEach(_.filter(definitions, d => d.credentialItem), (def) => {
    const name = convertIdentifierToClassName(def.identifier);
    const source = {};
    const { identifier } = def;

    function UCAConstructor(value, version) {
      const self = new Claim(identifier, value, version);
      return self;
    }

    source[name] = UCAConstructor;
    _.mixin(Claim, source);
  });
  return UCA;
}

module.exports = {
  Claim: mixinIdentifiers(Claim),
  definitions,
  getBaseIdentifiers,
  getClaimIdentifier: adaptIdentifierIfNeeded,
};
