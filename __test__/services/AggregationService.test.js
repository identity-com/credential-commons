const aggregate = require('../../src/services/AggregationService');

describe('Aggregation Service', () => {
  it('should throw Invalid Operator', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    expect(() => {
      aggregate(collection, [{ $toString: null }]);
    }).toThrow('Invalid operator: $toString');
  });

  it('should  return a collection with same equality', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ none: null }]);
    expect(result).toStrictEqual(collection);
  });

  it('should  return the first 2 elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $limit: 2 }]);
    expect(result).toStrictEqual(collection.slice(0, 2));
  });
});
