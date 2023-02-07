const SecureRandom = require('SecureRandom');

describe('Secure Random Tests', () => {
  it('should generate an random word', () => {
    const secureRandom = new SecureRandom();
    const random = secureRandom.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);
  });

  it('should initialize with seed', () => {
    try {
      const secureRandom = new SecureRandom('asdasd');
      const random = secureRandom.wordWith(16);
      expect(random).toBeDefined();
      expect(random).toHaveLength(16);
    } catch (e) {
      expect(e).toBeDefined();
      expect(e.message).toBe("generator isn't seeded");
    }
  });
});
