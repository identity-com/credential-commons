const _ = require('lodash');

class BaseAggregationOperator {
  static filter(credentials) {
    const filtered = [...credentials];
    return filtered;
  }
}

class LimitOperator extends BaseAggregationOperator {
  static filter(credentials, params) {
    if (!_.isNumber(params)) {
      throw new Error('Limit param must be a integer');
    }
    return [...(_.slice(credentials, 0, params))];
  }
}


const AGGREGATION_OPERATORS_MAP = {
  none: BaseAggregationOperator.filter,
  $limit: LimitOperator.filter,
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
