const aggregate = require('AggregationHandler');

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
    expect(result).toStrictEqual([{ k: 'a' }, { k: 'b' }]);
  });

  it('should  return the first elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $first: 'true' }]);
    expect(result).toStrictEqual([{ k: 'a' }]);
  });

  it('should  return the first elements using boolean', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $first: true }]);
    expect(result).toStrictEqual([{ k: 'a' }]);
  });

  it('should  return the last elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $last: 'true' }]);
    expect(result).toStrictEqual([{ k: 'c' }]);
  });

  it('should  return the last elements using boolean', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $last: true }]);
    expect(result).toStrictEqual([{ k: 'c' }]);
  });

  it('should  return the max elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $max: 'k' }]);
    expect(result).toStrictEqual([{ k: 'c' }]);
  });

  it('should  return the min elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = aggregate(collection, [{ $min: 'k' }]);
    expect(result).toStrictEqual([{ k: 'a' }]);
  });

  it('should  return in ascending order ', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = aggregate(collection, [{ $sort: { k: 'ASC' } }]);
    expect(result).toStrictEqual([{ k: 'a' }, { k: 'b' }, { k: 'c' }]);
  });

  it('should  return in descending order ', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = aggregate(collection, [{ $sort: { k: 'DES' } }]);
    expect(result).toStrictEqual([{ k: 'c' }, { k: 'b' }, { k: 'a' }]);
  });

  it('should apply operations in order', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = aggregate(collection, [
      { $sort: { k: 'DES' } },
      { $limit: 2 }]);
    expect(result).toStrictEqual([{ k: 'c' }, { k: 'b' }]);
  });
});
