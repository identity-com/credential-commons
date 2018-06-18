'use strict';

var _ = require('lodash');
var timestamp = require('unix-timestamp');
var sjcl = require('sjcl');
var SecureRandom = require('../SecureRandom');
var definitions = require('./definitions');

var validIdentifiers = _.map(definitions, function (d) {
  return d.identifier;
});

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
 * extract the expected Type name for the value when constructin an UCA
 * @param {*} definition
 */
var getTypeName = function getTypeName(definition) {
  if (_.isString(definition.type)) {
    if (_.includes(validIdentifiers, definition.type)) {
      var innerDefinition = _.find(definitions, { identifier: definition.type });
      return getTypeName(innerDefinition);
    }

    return definition.type;
  }
  return 'Object';
};

var resolveType = function resolveType(definition) {
  var typeName = getTypeName(definition);
  if (!(typeName === 'Object')) {
    return typeName;
  }

  if (!_.isString(definition.type)) {
    return definition.type;
  }

  var refDefinition = _.find(definitions, { identifier: definition.type });
  return resolveType(refDefinition);
};

/**
 * Creates new UCA instances
 * @param {*} identifier
 * @param {*} value
 */
function UCABaseConstructor(identifier, value, version) {
  var _this = this;

  this.timestamp = timestamp.now();
  this.id = null;

  if (!_.includes(validIdentifiers, identifier)) {
    throw new Error(identifier + ' is not defined');
  }

  this.identifier = identifier;
  var definition = version ? _.find(definitions, { identifier: identifier, version: version }) : _.find(definitions, { identifier: identifier });
  this.version = version || definition.version;

  this.type = getTypeName(definition);

  definition.type = resolveType(definition);
  if (isValueOfType(value, this.type)) {
    if (!isValid(value, this.type, definition)) {
      throw new Error(JSON.stringify(value) + ' is not valid for ' + identifier);
    }
    this.value = value;
    this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(SecureRandom.wordWith(64)));
  } else if (_.isEmpty(definition.type.properties)) {
    throw new Error(JSON.stringify(value) + ' is not valid for ' + identifier);
  } else {
    var hasRequireds = _.reduce(definition.type.required, function (has, required) {
      return value[required] && has;
    }, true);
    if (!hasRequireds) {
      throw new Error('Missing required fields to ' + identifier);
    }
    var ucaValue = _.mapValues(_.keyBy(_.map(value, function (v, k) {
      var propertyDef = _.find(definition.type.properties, { name: k });
      var uca = new UCABaseConstructor(propertyDef.type, v, propertyDef.version);
      return { key: k, value: uca };
    }), 'key'), 'value');
    this.value = ucaValue;
  }

  this.getAttestableValue = function () {
    switch (_this.type) {
      case 'String':
        return 's:' + _this.salt + ':' + _this.value;
      case 'Number':
        return 'n:' + _this.salt + ':' + _.padStart(_this.value.toString(), 8, '0');
      case 'Boolean':
        return 'b:' + _this.salt + ':' + _this.value;
      default:
        return _.reduce(_.sortBy(_.keys(_this.value)), function (s, k) {
          return '' + s + _this.value[k].getAttestableValue() + '|';
        }, '');
    }
  };

  this.getClaimRootPropertyName = function () {
    var identifierComponentes = _.split(_this.identifier, ':');
    return _.lowerCase(identifierComponentes[1]);
  };

  this.getClaimPropertyName = function () {
    var identifierComponentes = _.split(_this.identifier, ':');
    return identifierComponentes[2];
  };

  this.getClaimPath = function () {
    var identifierComponentes = _.split(_this.identifier, ':');
    var baseName = _.lowerCase(identifierComponentes[1]);
    return baseName + '.' + identifierComponentes[2];
  };

  this.getAttestableValues = function () {
    var values = [];
    var def = _.find(definitions, { identifier: _this.identifier, version: _this.version });
    if (def.credentialItem || def.attestable) {
      values.push({ identifier: _this.identifier, value: _this.getAttestableValue() });
      if (_this.type === 'Object') {
        _.forEach(_.keys(_this.value), function (k) {
          var innerValues = _this.value[k].getAttestableValues();
          _.reduce(innerValues, function (res, iv) {
            return res.push(iv);
          }, values);
        });
      }
    }
    return values;
  };

  this.getPlainValue = function (propName) {
    var newParent = {};
    var result = [];
    switch (_this.type) {
      case 'String':
      case 'Number':
      case 'Boolean':
        if (propName) {
          newParent[propName] = _this.value;
        } else {
          if (!_this.credentialItem) {
            return _this.value;
          }
          newParent[_this.identifier] = _this.value;
        }
        return newParent;
      default:

        _.forEach(_.sortBy(_.keys(_this.value)), function (k) {
          result.push(_this.value[k].getPlainValue(k));
        });
        _.forEach(result, function (properties) {
          _.assign(newParent, properties);
        });
        return newParent;
    }
  };

  var hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(this.getAttestableValue()));
  this.id = this.version + ':' + this.identifier + ':' + hash;

  return this;
}

var UCA = UCABaseConstructor;

function convertIdentifierToClassName(identifier) {
  var identifierComponentes = _.split(identifier, ':');
  var baseName = identifierComponentes[1];
  var detailName = _.upperFirst(_.camelCase(identifierComponentes[2]));
  return '' + baseName + detailName;
}

// Extend UCA Semantic
_.forEach(_.filter(definitions, function (d) {
  return d.credentialItem;
}), function (def) {
  var name = convertIdentifierToClassName(def.identifier);
  var source = {};
  var identifier = def.identifier;

  function UCAConstructor(value, version) {
    var self = new UCABaseConstructor(identifier, value, version);
    return self;
  }
  source[name] = UCAConstructor;
  _.mixin(UCA, source);
});

UCA.getTypeName = getTypeName;
UCA.resolveType = resolveType;

module.exports = UCA;