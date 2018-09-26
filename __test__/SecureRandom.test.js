const SecureRandom = require('../src/SecureRandom');

describe('Secure Random Tests', () => {
  it('should generate an random word', () => {
    const random = SecureRandom.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);
  });
});
