import SecureRandom from '../src/lib/SecureRandom';

describe('Secure Random Tests', () => {
  test('word', () => {
    let random = SecureRandom.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);

    random = SecureRandom.wordWith(64);
    expect(random).toBeDefined();
    expect(random).toHaveLength(64);

    random = SecureRandom.wordWith(8);
    expect(random).toBeDefined();
    expect(random).toHaveLength(8);
  });
});
