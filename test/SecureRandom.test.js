import SecureRandon from '../src/lib/SecureRandom';

describe('Secure Randon Tests', () => {
  test('word', () => {
    const random = SecureRandon.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);
  });
});
