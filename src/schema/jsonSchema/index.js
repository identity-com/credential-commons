/* eslint-disable global-require,import/no-dynamic-require */

/**
 * Imports and validates JSON Schema objects
 */

const path = require('path');
const fs = require('fs');
const Ajv = require('ajv').default;
const traverse = require('json-schema-traverse');
const addFormats = require('ajv-formats').default;

const { MissingSchemaError } = require('../../errors/definitions');
const fileLoader = require('./fileLoader');
const { parseIdentifier } = require('../../lib/stringUtils');

const ajv = new Ajv({
  logger: console,
  allErrors: true,
  verbose: true,
  loadSchema: fileLoader.loadSchema,
});
// add data formats such as date-time
addFormats(ajv);
ajv.addKeyword('attestable');

/**
 * For a given identifier, load its related schema and a reference to the part of it that this identifier uses.
 * E.g. if the identifier is claim-cvc:Identity.name-v1, load the schema claim-cvc:Identity.name-v1.
 * If the identifier is claim-cvc:Identity.name.givenName-v1,
 * load the schema claim-cvc:Identity.name-v1 and a reference
 * to http://identity.com/schemas/type-cvc:Name-v1#/definitions/name/properties/givenName
 *
 * This is used to allow claims of subschema without needing a schema for each property.
 * @param parsedIdentifier {Identifier}
 * @return {{schema: ({foundSchema}|*), parsedIdentifier: Identifier, ref: string}}
 */
// const loadSchemaObject = (parsedIdentifier) => {
//   const { foundSchema: schema, lastName } = schemaLoader;
//
//   const refMap = {};
//   traverse(schema, {
//     cb: (currentNode, currentPath, currentSchema, parent, nodeName) => {
//       if (nodeName === 'allOf') {
//         refMap[schema.$id] = currentNode.$ref;
//       }
//     },
//   });
//
//   // a property of the loaded schema is mapped to a definition in a type file.
//   // Ajv does not traverse these when performing validations of subschemas
//   // So the refMap allows us to find the correct location to validate a subschema.
//   let ref = schema.$id;
//   if (lastName !== parsedIdentifier.name) {
//     const subPath = parsedIdentifier.name.replace(lastName, '').replace(/\./g, '/');
//
//     ref = `${refMap[schema.$id]}/properties${subPath}`;
//   }
//
//   return {
//     ref,
//     schema,
//     parsedIdentifier,
//   };
// };

const validate = (schemaRef, value) => {
  const validateSchema = ajv.getSchema(schemaRef);
  const valid = validateSchema(value);

  if (!valid) throw new Error(`Invalid value. Errors: ${JSON.stringify(validateSchema.errors, null, 2)}`);
};

const loadSchemaOrParent = (uri) => {
  const validator = ajv.getSchema(uri);
  if (validator) return validator.schema;

  // remove path segment
  // match a dot followed by a string of characters ending with a version (e.g. -v1),
  // with positive lookahead on the version, to avoid matching it
  const newUri = uri.replace(/.\w+(?=-v\d+)/, '');

  if (newUri === uri) return null;
  return loadSchemaOrParent(newUri);
};

const loadSchemaObject = (uri) => {
  const schema = loadSchemaOrParent(uri);

  if (!schema) throw new MissingSchemaError(`No schema found for ${uri}`);

  let ref = schema.$id;
  if (uri !== schema.$id) {
    // a property of the loaded schema is mapped to a definition in a type file.
    // Ajv does not traverse these when performing validations of subschemas.
    // So we traverse the schema to find the correct location to validate a subschema.
    let foundRef = `${schema.$id}#`;
    // look through the schema to find the ref pointing to the properties of this schema
    traverse(schema, {
      cb: (currentNode, currentPath, currentSchema, parent, nodeName) => {
        if (nodeName === 'allOf') {
          // found the properties reference
          foundRef = currentNode.$ref;
        }
      },
    });

    // get the path of the subschema
    const [, , definitionPath] = parseIdentifier(uri);
    // get the name of the top-level schema
    const [, , schemaName] = parseIdentifier(schema.$id);
    const subPath = definitionPath
      .replace(schemaName, '') // get the subpath relative to the top-level schema
      .replace(/\./g, '/properties/'); // convert the dot syntax to schema / syntax

    ref = `${foundRef}${subPath}`;
  }

  return { schema, ref };
};

const initialize = () => fileLoader.loadAll(ajv).then((schemas) => {
  let data = '';
  for (const i in schemas) {
    data += `${schemas[i].schema.$id} :: ${schemas[i].schema.title}\n`;
  }

  console.log(data);

  console.log('Credential schemas are loaded');
  return schemas;
});

module.exports = { initialize, loadSchemaObject, validate };
