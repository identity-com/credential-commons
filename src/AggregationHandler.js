const _ = require('lodash');

const validateEmptyParametersOperators = (parameters) => {
  if (!_.isEmpty(parameters)) { throw new Error('parameters should be empty'); }
  return true;
};
const validateNotEmptyParametersOperators = (parameters) => {
  if (_.isEmpty(parameters)) { throw new Error('parameters should not be empty'); }
  return true;
};
const validatePathParametersOperators = (parameters) => {
  if (!_.isString(parameters)) { throw new Error('parameters should be string'); }
  return true;
};
const validateNumberParametersOperators = (parameters) => {
  if (!_.isNumber(parameters)) { throw new Error('parameters should be number'); }
  return true;
};
const validateObjectParametersOperators = (parameters) => {
  if (!_.isObject(parameters)) { throw new Error('parameters should be object'); }
  return true;
};

const sort = (colllection, params) => {
  const path = _.keys(params)[0];
  const order = params[path];
  const ordered = _.sortBy(colllection, path);
  return order === 'ASC' ? ordered : _.reverse(ordered);
};

const AGGREGATION_OPERATORS_MAP = {
  none: (collection, params) => (validateEmptyParametersOperators(params)
    ? [...collection] : null),
  $limit: (collection, params) => (validateNumberParametersOperators(params)
    ? [...(_.slice(collection, 0, params))] : null),
  $min: (collection, params) => (validatePathParametersOperators(params)
    ? [...(_.minBy(collection, params))] : null),
  $max: (collection, params) => (validatePathParametersOperators(params)
    ? [...(_.maxBy(collection, params))] : null),
  $first: (collection, params) => (validateNotEmptyParametersOperators(params)
    ? [_.first(collection)] : null),
  $last: (collection, params) => (validateNotEmptyParametersOperators(params)
    ? [_.last(collection)] : null),
  $sort: (collection, params) => (validateObjectParametersOperators(params)
    ? [...(sort(collection, params))] : null),
};

function aggregate(credentials, stages) {
  let filtered = [...credentials];
  _.forEach(stages, (stage) => {
    const operator = _.keys(stage)[0];

    if (!_.includes(_.keys(AGGREGATION_OPERATORS_MAP), operator)) {
      throw new Error(`Invalid operator: ${operator}`);
    }
    const params = stage[operator];
    const operatorImplementation = AGGREGATION_OPERATORS_MAP[operator];
    filtered = operatorImplementation(filtered, params);
  });
  return filtered;
}

module.exports = aggregate;
