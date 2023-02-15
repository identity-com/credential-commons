const CredentialCommons = require('index');

describe('CredentialCommons.aggregate', () => {
  it('should throw Invalid Operator', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    expect(() => {
      CredentialCommons.aggregate(collection, [{ $toString: null }]);
    }).toThrow('Invalid operator: $toString');
  });

  it('should  return a collection with same equality', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ none: null }]);
    expect(result).toStrictEqual(collection);
  });

  it('should  return the first 2 elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ $limit: 2 }]);
    expect(result).toStrictEqual([{ k: 'a' }, { k: 'b' }]);
  });

  it('should  return the first elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ $first: 'true' }]);
    expect(result).toStrictEqual([{ k: 'a' }]);
  });

  it('should  return the last elements only', () => {
    const collection = [{ k: 'a' }, { k: 'b' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ $last: 'true' }]);
    expect(result).toStrictEqual([{ k: 'c' }]);
  });

  it('should  return in ascending order ', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ $sort: { k: 'ASC' } }]);
    expect(result).toStrictEqual([{ k: 'a' }, { k: 'b' }, { k: 'c' }]);
  });

  it('should  return in descending order ', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [{ $sort: { k: 'DES' } }]);
    expect(result).toStrictEqual([{ k: 'c' }, { k: 'b' }, { k: 'a' }]);
  });

  it('should apply operations in order', () => {
    const collection = [{ k: 'b' }, { k: 'a' }, { k: 'c' }];
    const result = CredentialCommons.aggregate(collection, [
      { $sort: { k: 'DES' } },
      { $limit: 2 }]);
    expect(result).toStrictEqual([{ k: 'c' }, { k: 'b' }]);
  });
});
