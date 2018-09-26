/* eslint-disable no-use-before-define */
const randomString = require('randomstring');
const UCA = require('../../uca/UserCollectableAttribute');
const ucaDefinitions = require('../../uca/definitions');
const Type = require('type-of-is');
const RandExp = require('randexp');

const DRAFT = 'http://json-schema.org/draft-07/schema#';

const getPropertyNameFromDefinition = definition => {
  const substrIndex = definition.identifier.lastIndexOf('.') > -1 ? definition.identifier.lastIndexOf('.') + 1 : definition.identifier.lastIndexOf(':') + 1;
  return definition.identifier.substring(substrIndex);
};

const getPropertyType = value => Type.string(value).toLowerCase();

const processObject = (object, outputParam, nested) => {
  let output = outputParam;
  if (nested && output) {
    output = {
      properties: output
    };
  } else {
    output = output || {};
    output.type = getPropertyType(object);
    output.properties = output.properties || {};
  }
  const keys = Object.entries(object);
  // too much debate on this eslint
  // https://github.com/airbnb/javascript/issues/1122
  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of keys) {
    const type = getPropertyType(value);
    if (type === 'object') {
      output.properties[key] = processObject(value, output.properties[key]);
    } else if (type === 'array') {
      // recursion
      // eslint-disable-next-line
      output.properties[key] = processArray(value, output.properties[key]);
    } else {
      output.properties[key] = {};
      output.properties[key].type = type === 'null' ? ['null', 'string'] : type;
    }
  }
  return nested ? output.properties : output;
};

const processArray = (array, outputParam, nested) => {
  let output = outputParam;
  output = outputParam || {};
  output.type = getPropertyType(array);
  output.items = output.items || {};
  const type = getPropertyType(array[0]);
  output.items.type = type;
  return nested ? output.items : output;
};

/**
 * Entry point of this class. Use this to generate an sample json data
 * then an json schema from that data. That way you do not need to
 * create sample or mocks json from Credentials
 *
 * @param definition UCA/VC definition
 * @param json generated json
 * @returns {{$schema: string}} expected json schema to validate this data
 */
const process = (definition, json) => {
  const object = json;
  const title = definition.identifier;
  let processOutput;
  const output = {
    $schema: DRAFT
  };
  output.title = title;
  // Set initial object type
  output.type = Type.string(object).toLowerCase();

  // Process object
  if (output.type === 'object') {
    processOutput = processObject(object);
    output.type = processOutput.type;
    output.properties = processOutput.properties;
  }
  // for simple UCA get json schema properties
  if (typeof definition !== 'undefined' && definition !== null) {
    if (Array.isArray(definition.required)) {
      output.required = definition.required;
    } else if (definition.required) {
      output.required = [getPropertyNameFromDefinition(definition)];
    }
    if (typeof definition.minimum !== 'undefined' && definition.minimum !== null) {
      if (definition.exclusiveMinimum) {
        output.exclusiveMinimum = definition.minimum;
      } else {
        output.minimum = definition.minimum;
      }
    }
    if (typeof definition.maximum !== 'undefined' && definition.maximum !== null) {
      if (definition.exclusiveMaximum) {
        output.exclusiveMaximum = definition.maximum;
      } else {
        output.maximum = definition.maximum;
      }
    }
  }
  // never allow additionalProperties
  output.additionalProperties = false;
  // Output
  return output;
};

/**
 * Build a sample json from an definition identifier
 * Recursively make the UCA from nested properties and UCA references
 *
 * @param definition receive an UCA and build an sample json from it's properties
 * @returns {{$schema: string}}
 */
const buildSampleJson = definition => {
  let output = {};
  output = makeJsonRecursion(definition);
  return output;
};

/**
 * Recursion to build the schema from an json value
 * @param ucaDefinition
 */
const makeJsonRecursion = ucaDefinition => {
  let output = {};
  const typeName = UCA.getTypeName(ucaDefinition);
  if (typeof ucaDefinition.type === 'object' && ucaDefinition.type.properties !== undefined) {
    // array of properties
    ucaDefinition.type.properties.forEach(property => {
      output[property.name] = generateRandomValueForType(property.type);
    });
  } else if (typeName !== 'Object') {
    // not a reference
    const propertyName = getPropertyNameFromDefinition(ucaDefinition);
    if (typeof ucaDefinition.pattern !== 'undefined' && ucaDefinition.pattern !== null) {
      output[propertyName] = new RandExp(ucaDefinition.pattern).gen();
    } else {
      output[propertyName] = generateRandomValueForType(ucaDefinition.type);
    }
  } else {
    // a direct reference to a composite type
    output = generateRandomValueForType(ucaDefinition.type);
  }
  return output;
};

/**
 * This method is an auxiliary method to allow random values to easy create
 * json schemas from JSON values generated from UCA/VC
 *
 * @param definition
 * @returns {number}
 */
const generateRandomNumberValueWithRange = definition => {
  let genRandomNumber = Math.random() * 100;
  if (definition !== null) {
    /*
     * 6.2.5. exclusiveMinimum
     * The value of "exclusiveMinimum" MUST be number, representing an exclusive lower limit for a numeric instance.
     * If the instance is a number, then the instance is valid only if it has a value strictly greater than (not equal to) "exclusiveMinimum".
     */
    const exclusiveMinVariance = definition.exclusiveMinimum ? 1 : 0;
    /*
     * 6.2.3. exclusiveMaximum
     * The value of "exclusiveMaximum" MUST be number, representing an exclusive upper limit for a numeric instance.
     * If the instance is a number, then the instance is valid only if it has a value strictly less than (not equal to) "exclusiveMaximum".
     */
    const exclusiveMaxVariance = definition.exclusiveMaximum ? -1 : 0;
    if (typeof definition.minimum !== 'undefined' && definition.minimum !== null && typeof definition.maximum !== 'undefined' && definition.maximum !== null) {
      if (Number.isInteger(definition.minimum)) {
        genRandomNumber = Math.floor(definition.minimum + exclusiveMinVariance + Math.random() * (definition.maximum + exclusiveMaxVariance));
      }
      genRandomNumber = definition.minimum + Math.random() * definition.maximum;
    } else if (typeof definition.minimum !== 'undefined' && definition.minimum !== null) {
      if (Number.isInteger(definition.minimum)) {
        genRandomNumber = Math.floor(definition.minimum + exclusiveMinVariance + Math.random() * 100);
      }
      genRandomNumber = definition.minimum + Math.random() * 100;
    } else if (typeof definition.maximum !== 'undefined' && definition.maximum !== null) {
      if (Number.isInteger(definition.maximum)) {
        genRandomNumber = Math.floor(Math.random() * (definition.maximum + exclusiveMaxVariance));
      }
      genRandomNumber = Math.random() * definition.maximum;
    }
  }
  return genRandomNumber;
};

const generateRandomValueForType = typeName => {
  let refDefinition = null;
  let resolvedTypeName = typeName;
  if (typeName.includes(':')) {
    // simple composite, one depth level civ:Identity.name for example
    refDefinition = ucaDefinitions.find(def => def.identifier === typeName);
    if (refDefinition !== null) {
      resolvedTypeName = refDefinition.type;
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
      return Math.round(Math.random()) === 1;
    default:
      return makeJsonRecursion(refDefinition);
  }
};

module.exports = { process, buildSampleJson };