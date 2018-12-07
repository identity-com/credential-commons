const _ = require('lodash');
const sjcl = require('sjcl');
const { UserCollectableAttribute, definitions } = require('@identity.com/uca');
const { services } = require('../services');

class Claim extends UserCollectableAttribute {
  constructor(identifier, value, version) {
    super(identifier, value, version);
    this.initialize(identifier, value, version);
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
    const definition = this.version
      ? _.find(definitions, { identifier: this.identifier, version: this.version })
      : _.find(definitions, { identifier: this.identifier });

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
        const splitPropertyName = propertyName.split('.');
        // this property is used to check if the recursion tree has more than an depth
        const ucaNamespace = splitPropertyName[splitPropertyName.length - 2];
        const ucaNamespacePascal = ucaNamespace.substring(0, 1).toUpperCase() + ucaNamespace.substring(1);
        const ucaPropertyName = splitPropertyName[splitPropertyName.length - 1];
        let filteredIdentifier = `cvc:${ucaNamespacePascal}:${ucaPropertyName}`;
        // test if definition exists
        const filteredDefinition = definitions.find(def => def.identifier === filteredIdentifier);
        if (!filteredDefinition) {
          // this must have an claim path with no recursive definition
          filteredIdentifier = Claim.findDefinitionByAttestableValue(ucaPropertyName, definition);
        }
        ucaValue[propertyName] = new Claim(filteredIdentifier,
          { attestableValue: parsedAttestableValue[i].stringValue });
      }
      // console.log(ucaValue);
      this.value = ucaValue;
    }
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

  static findDefinitionByAttestableValue(attestableValuePropertyName, rootDefinition) {
    // eslint-disable-next-line no-restricted-syntax
    for (const property of rootDefinition.type.properties) {
      const resolvedDefinition = _.find(definitions, { identifier: property.type });
      resolvedDefinition.type = UserCollectableAttribute.resolveType(resolvedDefinition);
      if (!resolvedDefinition.type.properties && property.name === attestableValuePropertyName) {
        return property.type;
      }
      if (resolvedDefinition.type.properties) {
        return Claim.findDefinitionByAttestableValue(attestableValuePropertyName, resolvedDefinition);
      }
    }
    return null;
  }

  getAttestableValue(path) {
    // all UCA properties they have the form of :propertyName or :something.propertyName
    const startIndexForPropertyName = this.identifier.lastIndexOf(':');
    let propertyName = this.identifier.substring(startIndexForPropertyName + 1);
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
   * Returns the global CredentialItemIdentifier of the Credential
   */
  getGlobalCredentialItemIdentifier() {
    return `claim-${this.identifier}-${this.version}`;
  }

  getClaimRootPropertyName() {
    const identifierComponents = _.split(this.identifier, ':');
    return _.lowerCase(identifierComponents[1]);
  }

  getClaimPropertyName() {
    const identifierComponents = _.split(this.identifier, ':');
    return identifierComponents[2];
  }

  getClaimPath() {
    const identifierComponents = _.split(this.identifier, ':');
    const baseName = _.lowerCase(identifierComponents[1]);
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
}

function convertIdentifierToClassName(identifier) {
  const identifierComponents = _.split(identifier, ':');
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

module.exports = { Claim: mixinIdentifiers(Claim), definitions };
