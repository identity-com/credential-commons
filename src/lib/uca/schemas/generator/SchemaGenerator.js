import randomString from 'randomstring';
import { UCA, getTypeName, resolveType } from '../../UserCollectableAttribute';
import definitions from '../../definitions';

const Type = require('type-of-is');

function SchemaGenerator(definition) {
  /* eslint-disable no-use-before-define */
  // Constants
  this.DRAFT = 'http://json-schema.org/draft-07/schema#';
  this.definition = definition;

  function getPropertyFormat(value) {
    const type = Type.string(value).toLowerCase();

    if (type === 'date') return 'date-time';

    return null;
  }

  function getPropertyType(value) {
    const type = Type.string(value).toLowerCase();

    if (type === 'date') return 'string';
    if (type === 'regexp') return 'string';
    if (type === 'function') return 'string';

    return type;
  }

  function getUniqueKeys(a, b, c) {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    const required = c || [];

    let value;
    let cIndex;
    let aIndex;

    for (let keyIndex = 0, keyLength = bKeys.length; keyIndex < keyLength; keyIndex += 1) {
      value = aKeys[keyIndex];
      aIndex = aKeys.indexOf(value);
      cIndex = required.indexOf(value);

      if (aIndex === -1) {
        if (cIndex !== -1) {
          // Value is optional, it doesn't exist in A but exists in B(n)
          required.splice(cIndex, 1);
        }
      } else if (cIndex === -1) {
        // Value is required, it exists in both B and A, and is not yet present in C
        required.push(value);
      }
    }
    return required;
  }


  function processObject(object, outputParam, nested) {
    let output = outputParam;
    if (nested && output) {
      output = {
        properties: output,
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
      let type = getPropertyType(value);
      const format = getPropertyFormat(value);
      type = type === 'undefined' ? 'null' : type;
      if (type === 'object') {
        output.properties[key] = processObject(value, output.properties[key]);
      } else if (type === 'array') {
        // recursion
        // eslint-disable-next-line
        output.properties[key] = processArray(value, output.properties[key]);
      } else if (output.properties[key]) {
        const entry = output.properties[key];
        const hasTypeArray = Array.isArray(entry.type);
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
        output.properties[key].type = type;
        if (format) {
          output.properties[key].format = format;
        }
      }
    }
    return nested ? output.properties : output;
  }

  function processArray(array, outputParam, nested) {
    let format;
    let oneOf;
    let type;
    let output = outputParam;

    if (nested && output) {
      output = { items: output };
    } else {
      output = output || {};
      output.type = getPropertyType(array);
      output.items = output.items || {};
      type = output.items.type || null;
    }

    // Determine whether each item is different
    for (let arrIndex = 0, arrLength = array.length; arrIndex < arrLength; arrIndex += 1) {
      const elementType = getPropertyType(array[arrIndex]);
      const elementFormat = getPropertyFormat(array[arrIndex]);

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
          type,
        }],
        required: output.items.required,
      };
    }

    // Process each item depending
    if (typeof output.items.oneOf !== 'undefined' || type === 'object') {
      for (let itemIndex = 0, itemLength = array.length; itemIndex < itemLength; itemIndex += 1) {
        const value = array[itemIndex];
        const itemType = getPropertyType(value);
        const itemFormat = getPropertyFormat(value);
        let arrayItem;
        if (itemType === 'object') {
          if (output.items.properties) {
            output.items.required = getUniqueKeys(output.items.properties, value, output.items.required);
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
          const childType = Type.string(value).toLowerCase();
          const tempObj = {};
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
  }

  this.process = (titleParam, objectParam) => {
    let object = objectParam;
    let title = titleParam;
    let processOutput;
    const output = {
      $schema: this.DRAFT,
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
  this.buildSampleJson = () => {
    let output = {};
    output = this.makeJsonRecursion(this.definition);
    return output;
  };

  this.makeJsonRecursion = (ucaDefinition) => {
    const output = {};
    const typeName = getTypeName(ucaDefinition);
    if (typeof ucaDefinition.type === 'object' && ucaDefinition.type.properties !== undefined) { // array of properties
      ucaDefinition.type.properties.forEach((property) => {
        output[property.name] = this.generateRandomValueForType(property.type);
      });
    } else if (typeName === 'Object') {
      output[ucaDefinition.identifier] = this.generateRandomValueForType(ucaDefinition.type);
    } else { // a direct reference to a composite type
      output[ucaDefinition.identifier] = this.generateRandomValueForType(typeName);
    }
    return output;
  }

  this.generateRandomValueForType = (typeName) => {
    let refDefinition = null;
    if (typeName.includes(':')) { // simple composite, one depth level civ:Identity.name for example
      refDefinition = definitions.find(def => def.identifier === typeName);
    }
    // generate sample data
    // that's why the magic numbers are here
    switch (typeName) {
      case 'String':
        return randomString.generate(10);
      case 'Number':
        return Math.random() * 100;
      case 'Boolean':
        return (Math.round(Math.random()) === 1);
      default:
        return this.makeJsonRecursion(refDefinition);
    }
  };
}

export default SchemaGenerator;
