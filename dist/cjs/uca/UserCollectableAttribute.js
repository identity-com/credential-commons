'use strict';

const _ = require('lodash');
const timestamp = require('unix-timestamp');
const sjcl = require('sjcl');
const definitions = require('./definitions');
const { services } = require('../services');

const validIdentifiers = _.map(definitions, d => d.identifier);

/**
 * validate the value type
 * @param {*} value
 * @param {*} type
 */
function isValueOfType(value, type) {
  switch (type) {
    case 'String':
      return _.isString(value);
    case 'Number':
      return _.isNumber(value);
    case 'Boolean':
      return _.isBoolean(value);
    default:
      return false;
  }
}

function isValid(value, type, definition) {
  switch (type) {
    case 'String':
      return (definition.pattern ? definition.pattern.test(value) : true) && (definition.minimumLength ? value.length >= definition.minimumLength : true) && (definition.maximumLength ? value.length <= definition.minimumLength : true);
    case 'Number':
      return ((!_.isNil(definition.minimum) && definition.exclusiveMinimum ? value > definition.minimum : value >= definition.minimum) || _.isNil(definition.minimum)) && ((!_.isNil(definition.maximum) && definition.exclusiveMaximum ? value < definition.maximum : value <= definition.maximum) || _.isNil(definition.maximum));
    case 'Boolean':
      return _.isBoolean(value);
    default:
      return false;
  }
}

/**
 * extract the expected Type name for the value when constructing an UCA
 * @param {*} definition
 */
const getTypeName = definition => {
  if (_.isString(definition.type)) {
    if (_.includes(validIdentifiers, definition.type)) {
      const innerDefinition = _.find(definitions, { identifier: definition.type });
      return getTypeName(innerDefinition);
    }

    return definition.type;
  }
  return 'Object';
};

const resolveType = definition => {
  const typeName = getTypeName(definition);
  if (!(typeName === 'Object')) {
    return typeName;
  }

  if (!_.isString(definition.type)) {
    return definition.type;
  }

  const refDefinition = _.find(definitions, { identifier: definition.type });
  return resolveType(refDefinition);
};

const findDefinitionByAttestableValue = (attestableValuePropertyName, rootDefinition) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const property of rootDefinition.type.properties) {
    const resolvedDefinition = _.find(definitions, { identifier: property.type });
    resolvedDefinition.type = resolveType(resolvedDefinition);
    if (!resolvedDefinition.type.properties && property.name === attestableValuePropertyName) {
      return property.type;
    }
    if (resolvedDefinition.type.properties) {
      return findDefinitionByAttestableValue(attestableValuePropertyName, resolvedDefinition);
    }
  }
  return null;
};

const getAllProperties = (identifier, pathName) => {
  const definition = _.find(definitions, { identifier });
  const properties = [];
  const type = resolveType(definition);
  const typeDefinition = _.isString(type) ? _.find(definitions, { identifier: type }) : definition;

  if (typeDefinition && getTypeName(typeDefinition) === 'Object') {
    let typeDefProps;
    if (typeDefinition.type.properties) {
      typeDefProps = typeDefinition.type.properties;
    } else {
      const typeDefDefinition = _.find(definitions, { identifier: typeDefinition.type });
      typeDefProps = resolveType(typeDefDefinition).properties;
    }

    let basePropName;
    const baseIdentifierComponents = _.split(typeDefinition.identifier, ':');
    if (pathName) {
      if (_.includes(pathName, _.lowerCase(baseIdentifierComponents[1]))) {
        basePropName = `${pathName}.${baseIdentifierComponents[2]}`;
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
      _.forEach(typeDefProps, prop => {
        const typeSuffix = _.split(prop.type, ':')[2];
        const newBasePropName = prop.name === typeSuffix ? basePropName : `${basePropName}.${prop.name}`;
        const proProperties = getAllProperties(prop.type, newBasePropName);
        _.forEach(proProperties, p => properties.push(p));
      });
    }
  } else if (pathName) {
    const propertiesName = `${pathName}.${_.split(definition.identifier, ':')[2]}`;
    properties.push(propertiesName);
  } else {
    const identifierComponents = _.split(identifier, ':');
    const propertiesName = `${_.lowerCase(identifierComponents[1])}.${identifierComponents[2]}`;
    properties.push(propertiesName);
  }
  return properties;
};

const isAttestableValue = value => value && value.attestableValue;

const parseAttestableValue = value => {
  const values = [];
  const splitPipes = _.split(value.attestableValue, '|');
  const attestableValueRegex = /^urn:(\w+(?:\.\w+)*):(\w+):(.+)/;
  _.each(splitPipes, stringValue => {
    const match = attestableValueRegex.exec(stringValue);
    if (match && match.length === 4) {
      const v = {
        propertyName: match[1],
        salt: match[2],
        value: match[3],
        stringValue
      };
      values.push(v);
    }
  });
  if (splitPipes.length !== values.length && splitPipes.length !== values.length + 1) {
    throw new Error('Invalid attestableValue');
  }
  return values;
};

/**
 * Creates new UCA instances
 * @param {*} identifier
 * @param {*} value
 */
function UCABaseConstructor(identifier, value, version) {
  this.timestamp = null;
  this.id = null;
  this.secureRandom = services.container.SecureRandom;

  if (!_.includes(validIdentifiers, identifier)) {
    throw new Error(`${identifier} is not defined`);
  }

  this.identifier = identifier;
  const definition = version ? _.find(definitions, { identifier, version }) : _.find(definitions, { identifier });
  this.version = version || definition.version;

  this.type = getTypeName(definition);

  definition.type = resolveType(definition);
  if (isAttestableValue(value)) {
    // Trying to construct UCA with a existing attestableValue
    const parsedAttestableValue = parseAttestableValue(value);
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
          filteredIdentifier = findDefinitionByAttestableValue(ucaPropertyName, definition);
        }
        ucaValue[propertyName] = new UCABaseConstructor(filteredIdentifier, { attestableValue: parsedAttestableValue[i].stringValue });
      }
      // console.log(ucaValue);
      this.value = ucaValue;
    }
  } else if (isValueOfType(value, this.type)) {
    // Trying to construct UCA with a normal value
    this.timestamp = timestamp.now();
    if (!isValid(value, this.type, definition)) {
      throw new Error(`${JSON.stringify(value)} is not valid for ${identifier}`);
    }
    this.value = value;

    this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(this.secureRandom.wordWith(64)));
  } else if (_.isEmpty(definition.type.properties)) {
    throw new Error(`${JSON.stringify(value)} is not valid for ${identifier}`);
  } else {
    const hasRequireds = _.reduce(definition.type.required, (has, required) => value[required] && has, true);
    if (!hasRequireds) {
      throw new Error(`Missing required fields to ${identifier}`);
    }
    const ucaValue = _.mapValues(_.keyBy(_.map(value, (v, k) => {
      const propertyDef = _.find(definition.type.properties, { name: k });
      const uca = new UCABaseConstructor(propertyDef.type, v, propertyDef.version);
      return { key: k, value: uca };
    }), 'key'), 'value');
    this.value = ucaValue;
  }

  this.getAttestableValue = path => {
    // all UCA properties they have the form of :propertyName or :something.propertyName
    const startIndexForPropertyName = this.identifier.lastIndexOf(':');
    let propertyName = this.identifier.substring(startIndexForPropertyName + 1);
    if (path) {
      propertyName = `${path}.${propertyName}`;
    }
    // it was defined that the attestable value would be on the URN type https://tools.ietf.org/html/rfc8141
    switch (this.type) {
      case 'String':
        return `urn:${propertyName}:${this.salt}:${this.value}|`;
      case 'Number':
        return `urn:${propertyName}:${this.salt}:${this.value}|`;
      case 'Boolean':
        return `urn:${propertyName}:${this.salt}:${this.value}|`;
      default:
        return _.reduce(_.sortBy(_.keys(this.value)), (s, k) => `${s}${this.value[k].getAttestableValue(propertyName)}`, '');
    }
  };

  /**
   * Returns the global CredentialItemIdentifier of the Credential
   */
  this.getGlobalCredentialItemIdentifier = () => `claim-${this.identifier}-${this.version}`;

  this.getClaimRootPropertyName = () => {
    const identifierComponents = _.split(this.identifier, ':');
    return _.lowerCase(identifierComponents[1]);
  };

  this.getClaimPropertyName = () => {
    const identifierComponents = _.split(this.identifier, ':');
    return identifierComponents[2];
  };

  this.getClaimPath = () => {
    const identifierComponents = _.split(this.identifier, ':');
    const baseName = _.lowerCase(identifierComponents[1]);
    return `${baseName}.${identifierComponents[2]}`;
  };

  this.getAttestableValues = () => {
    const values = [];
    const def = _.find(definitions, { identifier: this.identifier, version: this.version });
    if (def.credentialItem || def.attestable) {
      values.push({ identifier: this.identifier, value: this.getAttestableValue() });
      if (this.type === 'Object') {
        _.forEach(_.keys(this.value), k => {
          const innerValues = this.value[k].getAttestableValues();
          _.reduce(innerValues, (res, iv) => res.push(iv), values);
        });
      }
    }
    return values;
  };

  this.getPlainValue = propName => {
    const newParent = {};
    const result = [];
    switch (this.type) {
      case 'String':
      case 'Number':
      case 'Boolean':
        if (propName) {
          newParent[propName] = this.value;
        } else {
          if (!this.credentialItem) {
            return this.value;
          }
          newParent[this.identifier] = this.value;
        }
        return newParent;
      default:
        _.forEach(_.sortBy(_.keys(this.value)), k => {
          result.push(this.value[k].getPlainValue(k));
        });
        _.forEach(result, properties => {
          if (propName) {
            newParent[propName] = newParent[propName] ? newParent[propName] : {};
            _.assign(newParent[propName], properties);
          } else {
            _.assign(newParent, properties);
          }
        });
        return newParent;
    }
  };

  const hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(this.getAttestableValue()));
  this.id = `${this.version}:${this.identifier}:${hash}`;

  return this;
}

const UCA = UCABaseConstructor;

function convertIdentifierToClassName(identifier) {
  const identifierComponents = _.split(identifier, ':');
  const baseName = identifierComponents[1];
  const detailName = _.upperFirst(_.camelCase(identifierComponents[2]));
  return `${baseName}${detailName}`;
}

// Extend UCA Semantic
_.forEach(_.filter(definitions, d => d.credentialItem), def => {
  const name = convertIdentifierToClassName(def.identifier);
  const source = {};
  const { identifier } = def;

  function UCAConstructor(value, version) {
    const self = new UCABaseConstructor(identifier, value, version);
    return self;
  }

  source[name] = UCAConstructor;
  _.mixin(UCA, source);
});

UCA.getTypeName = getTypeName;
UCA.resolveType = resolveType;
UCA.getAllProperties = getAllProperties;

module.exports = UCA;