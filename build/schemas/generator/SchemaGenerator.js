'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-use-before-define */
var randomString = require('randomstring');
var UCA = require('../../uca/UserCollectableAttribute');
var ucaDefinitions = require('../../uca/definitions');
var Type = require('type-of-is');
var RandExp = require('randexp');

var DRAFT = 'http://json-schema.org/draft-07/schema#';

var getPropertyNameFromDefinition = function getPropertyNameFromDefinition(definition) {
  var substrIndex = definition.identifier.lastIndexOf('.') > -1 ? definition.identifier.lastIndexOf('.') + 1 : definition.identifier.lastIndexOf(':') + 1;
  return definition.identifier.substring(substrIndex);
};

/**
 * Generate json schemas from JSON sample data generated from UCA/Credentials identifiers
 */
var getPropertyFormat = function getPropertyFormat(value) {
  var type = Type.string(value).toLowerCase();

  if (type === 'date') return 'date-time';

  return null;
};

var getPropertyType = function getPropertyType(value) {
  var type = Type.string(value).toLowerCase();

  if (type === 'date') return 'string';
  if (type === 'regexp') return 'string';
  if (type === 'function') return 'string';

  return type;
};

var getUniqueKey = function getUniqueKey(property, requiredArray) {
  var required = requiredArray || [];
  return required;
};

var processObject = function processObject(object, outputParam, nested) {
  var output = outputParam;
  if (nested && output) {
    output = {
      properties: output
    };
  } else {
    output = output || {};
    output.type = getPropertyType(object);
    output.properties = output.properties || {};
  }
  var keys = Object.entries(object);
  // too much debate on this eslint
  // https://github.com/airbnb/javascript/issues/1122
  // eslint-disable-next-line no-restricted-syntax
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _ref = _step.value;

      var _ref2 = (0, _slicedToArray3.default)(_ref, 2);

      var key = _ref2[0];
      var value = _ref2[1];

      var type = getPropertyType(value);
      var format = getPropertyFormat(value);
      type = type === 'undefined' ? 'string' : type;
      if (type === 'object') {
        output.properties[key] = processObject(value, output.properties[key]);
      } else if (type === 'array') {
        // recursion
        // eslint-disable-next-line
        output.properties[key] = processArray(value, output.properties[key]);
      } else if (output.properties[key]) {
        var entry = output.properties[key];
        var hasTypeArray = Array.isArray(entry.type);
        // When an array already exists, we check the existing
        // type array to see if it contains our current property
        // type, if not, we add it to the array and continue
        if (hasTypeArray && entry.type.indexOf(type) < 0) {
          entry.type.push(type);
        }
        // When multiple fields of differing types occur,
        // json schema states that the field must specify the
        // primitive types the field allows in array format.
        if (!hasTypeArray && entry.type !== type) {
          entry.type = [entry.type, type];
        }
      } else {
        output.properties[key] = {};
        output.properties[key].type = type === 'null' ? ['null', 'string'] : type;
        if (format) {
          output.properties[key].format = format;
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return nested ? output.properties : output;
};

var processArray = function processArray(array, outputParam, nested) {
  var format = void 0;
  var oneOf = void 0;
  var type = void 0;
  var output = outputParam;

  if (nested && output) {
    output = { items: output };
  } else {
    output = output || {};
    output.type = getPropertyType(array);
    output.items = output.items || {};
    type = output.items.type || null;
  }

  // Determine whether each item is different
  for (var arrIndex = 0, arrLength = array.length; arrIndex < arrLength; arrIndex += 1) {
    var elementType = getPropertyType(array[arrIndex]);
    var elementFormat = getPropertyFormat(array[arrIndex]);

    if (type && elementType !== type) {
      output.items.oneOf = [];
      oneOf = true;
      break;
    } else {
      type = elementType;
      format = elementFormat;
    }
  }

  // Setup type otherwise
  if (!oneOf && type) {
    output.items.type = type;
    if (format) {
      output.items.format = format;
    }
  } else if (oneOf && type !== 'object') {
    output.items = {
      oneOf: [{
        type: type
      }],
      required: output.items.required
    };
  }

  // Process each item depending
  if (typeof output.items.oneOf !== 'undefined' || type === 'object') {
    for (var itemIndex = 0, itemLength = array.length; itemIndex < itemLength; itemIndex += 1) {
      var value = array[itemIndex];
      var itemType = getPropertyType(value);
      var itemFormat = getPropertyFormat(value);
      var arrayItem = void 0;
      if (itemType === 'object') {
        if (output.items.properties) {
          output.items.required = getUniqueKey(value, output.items.required);
        }
        arrayItem = processObject(value, oneOf ? {} : output.items.properties, true);
      } else if (itemType === 'array') {
        arrayItem = processArray(value, oneOf ? {} : output.items.properties, true);
      } else {
        arrayItem = {};
        arrayItem.type = itemType;
        if (itemFormat) {
          arrayItem.format = itemFormat;
        }
      }
      if (oneOf) {
        var childType = Type.string(value).toLowerCase();
        var tempObj = {};
        if (!arrayItem.type && childType === 'object') {
          tempObj.properties = arrayItem;
          tempObj.type = 'object';
          arrayItem = tempObj;
        }
        output.items.oneOf.push(arrayItem);
      } else if (output.items.type === 'object') {
        output.items.properties = arrayItem;
      }
    }
  }
  return nested ? output.items : output;
};

var process = function process(definition, json) {
  var object = json;
  var title = definition.identifier;
  var processOutput = void 0;
  var output = {
    $schema: DRAFT
  };

  // Determine title exists
  if (typeof title !== 'string') {
    object = title;
    title = undefined;
  } else {
    output.title = title;
  }

  // Set initial object type
  output.type = Type.string(object).toLowerCase();

  // Process object
  if (output.type === 'object') {
    processOutput = processObject(object);
    output.type = processOutput.type;
    output.properties = processOutput.properties;
  }

  if (output.type === 'array') {
    processOutput = processArray(object);
    output.type = processOutput.type;
    output.items = processOutput.items;

    if (output.title) {
      output.items.title = output.title;
      output.title += ' Set';
    }
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
 * TODO minimum: 0,
 * TODO exclusiveMinimum: true,
 * TODO maximum: 32,
 * TODO exclusiveMaximum: true,
 * TODO array -> values
 * TODO DocType
 *
 * @param definition receive an UCA and build an sample json from it's properties
 * @returns {{$schema: string}}
 */
var buildSampleJson = function buildSampleJson(definition) {
  var output = {};
  output = makeJsonRecursion(definition);
  return output;
};

var makeJsonRecursion = function makeJsonRecursion(ucaDefinition) {
  var output = {};
  var typeName = UCA.getTypeName(ucaDefinition);
  if ((0, _typeof3.default)(ucaDefinition.type) === 'object' && ucaDefinition.type.properties !== undefined) {
    // array of properties
    ucaDefinition.type.properties.forEach(function (property) {
      output[property.name] = generateRandomValueForType(property.type);
    });
  } else if (typeName !== 'Object') {
    // not a reference
    var propertyName = getPropertyNameFromDefinition(ucaDefinition);
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

var generateRandomNumberValueWithRange = function generateRandomNumberValueWithRange(definition) {
  var genRandomNumber = Math.random() * 100;
  if (definition !== null) {
    /*
     * 6.2.5. exclusiveMinimum
     * The value of "exclusiveMinimum" MUST be number, representing an exclusive lower limit for a numeric instance.
     * If the instance is a number, then the instance is valid only if it has a value strictly greater than (not equal to) "exclusiveMinimum".
     */
    var exclusiveMinVariance = definition.exclusiveMinimum ? 1 : 0;
    /*
     * 6.2.3. exclusiveMaximum
     * The value of "exclusiveMaximum" MUST be number, representing an exclusive upper limit for a numeric instance.
     * If the instance is a number, then the instance is valid only if it has a value strictly less than (not equal to) "exclusiveMaximum".
     */
    var exclusiveMaxVariance = definition.exclusiveMaximum ? -1 : 0;
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

var generateRandomValueForType = function generateRandomValueForType(typeName) {
  var refDefinition = null;
  var resolvedTypeName = typeName;
  if (typeName.includes(':')) {
    // simple composite, one depth level civ:Identity.name for example
    refDefinition = ucaDefinitions.find(function (def) {
      return def.identifier === typeName;
    });
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

module.exports = { process: process, buildSampleJson: buildSampleJson };