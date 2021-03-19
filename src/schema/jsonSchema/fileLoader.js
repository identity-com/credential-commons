const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const { parseIdentifier } = require('../../lib/stringUtils');

const fsp = fs.promises;

/**
 * Find the base path for the schemas in the filesystem.
 * This function allows the library to be imported as an
 * npm module or in the browser, packaged with webpack etc
 * without losing flexibility.
 *
 * TODO
 * This will probably be replaced by either a more deterministic
 * method, once remote downloading of schemas is in place.
 */
const findBasePath = () => {
  const schemaFolderName = 'schemas';

  const parent = (currentPath) => {
    const pathParent = path.dirname(currentPath);
    if (pathParent === currentPath) return null;
    return pathParent;
  };

  const pathHasSchemasFolder = (pathToCheck) => fs.existsSync(path.join(pathToCheck, schemaFolderName));

  const findBasePathRecursive = (currentPath) => {
    if (pathHasSchemasFolder(currentPath)) return path.join(currentPath, schemaFolderName);

    const pathParent = parent(currentPath);
    if (!pathParent) return null;

    return findBasePathRecursive(pathParent);
  };

  const schemaBasePath = findBasePathRecursive(__dirname);

  if (!schemaBasePath) throw new Error(`Schema base path not found relative to ${__dirname}`);

  return schemaBasePath;
};

const basePath = findBasePath();

/**
 * Load schemas from the file system.
 * @param uri
 */
const loadSchema = (uri) => {
  const components = parseIdentifier(decodeURI(uri));
  if (!components) throw new Error(`Invalid URI ${uri}`);
  const [, type, name, version] = components;
  const schemaPath = path.join(basePath, type, version, `${type}-${name}.schema.json`);
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const schema = require(schemaPath);

  return Promise.resolve(schema);
};

const loadAll = async (ajv) => {
  const recursiveLoadAll = async (schemaPath) => {
    const filesOrDirectories = await fsp.readdir(schemaPath);
    const allPromises = filesOrDirectories.map(async (fileOrDirectory) => {
      const subpath = path.join(schemaPath, fileOrDirectory);

      const stats = await fsp.lstat(subpath);
      if (!stats.isDirectory()) {
        // eslint-disable-next-line import/no-dynamic-require,global-require
        return ajv.compileAsync(require(subpath));
      }

      return recursiveLoadAll(subpath);
    });

    return Promise.all(allPromises).then((schemas) => _.flatten(schemas));
  };

  return recursiveLoadAll(basePath);
};

module.exports = {
  loadSchema,
  loadAll,
};
