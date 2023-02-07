import _ from 'lodash';

const validateEmptyParametersOperators = (parameters: unknown) => {
    if (!_.isEmpty(parameters)) {
        throw new Error('parameters should be empty');
    }
    return true;
};
const validateNotEmptyParametersOperators = (parameters: unknown) => {
    if (!parameters && _.isEmpty(parameters)) {
        throw new Error('parameters should not be empty');
    }
    return true;
};
const validatePathParametersOperators = (parameters: unknown) => {
    if (!_.isString(parameters)) {
        throw new Error('parameters should be string');
    }
    return true;
};
const validateNumberParametersOperators = (parameters: unknown) => {
    if (!_.isNumber(parameters)) {
        throw new Error('parameters should be number');
    }
    return true;
};
const validateObjectParametersOperators = (parameters: unknown) => {
    if (!_.isObject(parameters)) {
        throw new Error('parameters should be object');
    }
    return true;
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
const sort = (collection: Array<object>, params: any) => {
    const path = _.keys(params)[0];
    const order = params[path];
    const ordered = _.sortBy(collection, path);
    return order === 'ASC' ? ordered : _.reverse(ordered);
};

const AGGREGATION_OPERATORS_MAP = {
    none: (collection: Array<object>, params: unknown) => (validateEmptyParametersOperators(params)
        ? [...collection] : null),
    $limit: (collection: Array<object>, params: number) => (validateNumberParametersOperators(params)
        ? [...(_.slice(collection, 0, params))] : null),
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    $min: (collection: Array<object>, params: any) => (validatePathParametersOperators(params)
        ? [(_.minBy(collection, params))] : null),
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    $max: (collection: Array<object>, params: any) => (validatePathParametersOperators(params)
        ? [(_.maxBy(collection, params))] : null),
    $first: (collection: Array<object>, params: unknown) => (validateNotEmptyParametersOperators(params)
        ? [_.first(collection)] : null),
    $last: (collection: Array<object>, params: unknown) => (validateNotEmptyParametersOperators(params)
        ? [_.last(collection)] : null),
    $sort: (collection: Array<object>, params: unknown) => (validateObjectParametersOperators(params)
        ? [...(sort(collection, params))] : null),
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
function aggregate(credentials: Array<object>, stages: any) {
    let filtered = [...credentials];
    _.forEach(stages, (stage) => {
        const operator: string = _.keys(stage)[0];
        if (!_.includes(_.keys(AGGREGATION_OPERATORS_MAP), operator)) {
            throw new Error(`Invalid operator: ${operator}`);
        }
        const params = stage[operator];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const operatorImplementation = AGGREGATION_OPERATORS_MAP[operator];
        filtered = operatorImplementation(filtered, params);
    });
    return filtered;
}

export = aggregate