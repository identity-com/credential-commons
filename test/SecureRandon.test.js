import SecureRandon from '../src/lib/SecureRandom';

describe('Secure Randon Tests', () => {
  test('word', () => {
    let random = SecureRandon.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);

    random = SecureRandon.wordWith(64);
    expect(random).toBeDefined();
    expect(random).toHaveLength(64);

    random = SecureRandon.wordWith(8);
    expect(random).toBeDefined();
    expect(random).toHaveLength(8);
  });
});
