/* eslint-disable no-use-before-define */
const randomString = require('randomstring');
const Type = require('type-of-is');
const RandExp = require('randexp');
const { Claim, definitions, getBaseIdentifiers } = require('../../claim/Claim');

const DRAFT = 'http://json-schema.org/draft-07/schema#';

const getPropertyNameFromDefinition = definition => getBaseIdentifiers(definition.identifier).identifierComponents[2];

const getPropertyType = value => Type.string(value).toLowerCase();

const processObject = (object, outputParam, parentKey) => {
  const output = outputParam || {};
  const objectProperties = object;
  const { definition } = objectProperties;
  delete objectProperties.definition;

  output.type = getPropertyType(objectProperties);
  output.properties = output.properties || {};
  const keys = Object.entries(objectProperties);

  // too much debate on this eslint
  // https://github.com/airbnb/javascript/issues/1122
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of keys) {
    // we have to get the required array from the definitions properties

    const type = getPropertyType(value);
    if (type === 'object') {
      output.properties[key] = processObject(value, output.properties[key], `${parentKey}.${key}`);
    } else if (type === 'array') {
      // recursion
      // eslint-disable-next-line
      output.properties[key] = processArray(value, output.properties[key], key);
    } else {
      output.properties[key] = {};
      output.properties[key].type = type === 'null' ? ['null', 'string'] : type;
      if (definition && definition.type.properties) {
        let propType = definition.type.properties.find(prop => prop.name === key);
        // simple composite, one depth level civ:Identity.name for example
        if (propType && propType.type.includes(':')) {
          propType = definitions.find(def => def.identifier === propType.type);
        }

        output.properties[key] = addMinimumMaximum(propType, output.properties[key]);
      } else {
        output.properties[key] = addMinimumMaximum(definition, output.properties[key]);
      }
    }
  }
  // it must be 4 here, we start the json of the VC with root
  // then it's claim, then all standardize Claim are type:name
  if (parentKey.includes('claim') && parentKey.split('.').length === 4) {
    // with the json key of the claim
    const baseUcaName = parentKey.substring('root.claim.'.length);
    let typeName = (baseUcaName.substring(0, 1).toUpperCase() + baseUcaName.substring(1)).replace('.', ':');
    // regenerate uca
    let refDefinition = definitions.find(def => def.identifier.includes(typeName));
    if (refDefinition == null) {
      const baseName = (baseUcaName.substring(0, 1).toUpperCase() + baseUcaName.substring(1));
      typeName = `claim-cvc:${baseName}-v1`;
      refDefinition = definitions.find(def => def.identifier.includes(typeName));
    }
    if (refDefinition == null) {
      typeName = `claim-cvc:${baseUcaName}-v1`;
      refDefinition = definitions.find(def => def.identifier.includes(typeName));
    }
    // get it's required definitions
    output.required = refDefinition.type.required;
  }
  output.additionalProperties = false;
  return output;
};

const processArray = (array, outputParam) => {
  const output = outputParam || {};
  output.type = getPropertyType(array);
  output.items = output.items || {};
  const type = getPropertyType(array[0]);
  output.items.type = type;
  output.additionalProperties = false;
  return output;
};

/**
 * Entry point of this class. Use this to generate an sample json data
 * then an json schema from that data. That way you do not need to
 * create sample or mocks json from Credentials
 *
 * @param definition Claim/VC definition
 * @param json generated json
 * @returns {{$schema: string}} expected json schema to validate this data
 */
const process = (definition, json) => {
  const object = json;
  const title = definition.identifier;
  let processOutput;
  let output = {
    $schema: DRAFT,
  };
  output.title = title;
  // Set initial object type
  output.type = Type.string(object).toLowerCase();

  // Process object
  if (output.type === 'object') {
    processOutput = processObject(object, {}, 'root');
    output.type = processOutput.type;
    output.properties = processOutput.properties;
  }

  output = addMinimumMaximum(definition, output);

  // never allow additionalProperties
  output.additionalProperties = false;
  // Output
  return output;
};

/**
 * Build a sample json from an definition identifier
 * Recursively make the Claim from nested properties and Claim references
 *
 * @param definition receive an Claim and build an sample json from it's properties
 * @returns {{$schema: string}}
 */
const buildSampleJson = (definition, includeDefinitions = false) => {
  let output = {};
  output = makeJsonRecursion(definition, includeDefinitions);
  return output;
};

/**
 * Recursion to build the schema from an json value
 * @param ucaDefinition
 */
const makeJsonRecursion = (ucaDefinition, includeDefinitions = false) => {
  let output = {};
  const typeName = Claim.getTypeName(ucaDefinition);
  if (typeof ucaDefinition.type === 'object' && ucaDefinition.type.properties !== undefined) { // array of properties
    ucaDefinition.type.properties.forEach((property) => {
      output[property.name] = generateRandomValueForType(property, includeDefinitions);
    });
  } else if (typeName !== 'Object') { // not a reference
    const propertyName = getPropertyNameFromDefinition(ucaDefinition);
    if (typeof ucaDefinition.pattern !== 'undefined' && ucaDefinition.pattern !== null) {
      output[propertyName] = new RandExp(ucaDefinition.pattern).gen();
    } else {
      output[propertyName] = generateRandomValueForType(ucaDefinition, includeDefinitions);
    }
  } else { // a direct reference to a composite type
    output = generateRandomValueForType(ucaDefinition, includeDefinitions);
  }
  if (includeDefinitions && output.definition == null) {
    output.definition = ucaDefinition;
  }
  return output;
};

/**
 * This method is an auxiliary method to allow random values to easy create
 * json schemas from JSON values generated from Claim/VC
 *
 * @param definition
 * @returns {number}
 */
const generateRandomNumberValueWithRange = (definition) => {
  let genRandomNumber = Math.random() * 100;

  if (definition !== null) {
    if (typeof definition.minimum !== 'undefined' && definition.minimum !== null
        && genRandomNumber < definition.minimum) {
      genRandomNumber = definition.minimum;
    }

    if (definition.exclusiveMinimum !== 'undefined' && definition.exclusiveMinimum !== null
        && genRandomNumber <= definition.exclusiveMinimum) {
      genRandomNumber = definition.exclusiveMinimum + 0.1;
    }

    if (typeof definition.maximum !== 'undefined' && definition.maximum !== null
        && genRandomNumber > definition.maximum) {
      genRandomNumber = definition.maximum;
    }

    if (definition.exclusiveMaximum !== 'undefined' && definition.exclusiveMaximum !== null
        && genRandomNumber >= definition.exclusiveMaximum) {
      genRandomNumber = definition.exclusiveMaximum - 0.1;
    }
  }

  return genRandomNumber;
};

const generateRandomValueForType = (definition, includeDefinitions = false) => {
  const typeName = definition.type;
  let refDefinition = definition;
  let resolvedTypeName = typeName;
  if (typeName.includes(':')) { // simple composite, one depth level civ:Identity.name for example
    refDefinition = definitions.find(def => def.identifier === typeName);
    if (refDefinition !== null) {
      resolvedTypeName = Claim.resolveType(refDefinition);
    }
  }
  // generate sample data
  // that's why the magic numbers are here
  switch (resolvedTypeName) {
    case 'String':
      return randomString.generate(10);
    case 'Number':
      return generateRandomNumberValueWithRange(refDefinition);
    case 'Boolean':
      return (Math.round(Math.random()) === 1);
    default:
      return makeJsonRecursion(refDefinition, includeDefinitions);
  }
};

const addMinimumMaximum = (definition, object) => {
  const output = object;
  // for simple Claim get json schema properties
  if (typeof definition !== 'undefined' && definition !== null) {
    if (definition.exclusiveMinimum != null) {
      output.exclusiveMinimum = definition.exclusiveMinimum;
    }

    if (definition.minimum != null) {
      output.minimum = definition.minimum;
    }

    if (definition.exclusiveMaximum != null) {
      output.exclusiveMaximum = definition.exclusiveMaximum;
    }

    if (definition.maximum != null) {
      output.maximum = definition.maximum;
    }
  }
  return output;
};

module.exports = { process, buildSampleJson };
