const { services } = require('../src/services');

const secureRandom = services.container.SecureRandom;

describe('Secure Random Tests', () => {
  it('should generate an random word', () => {
    const random = secureRandom.wordWith(16);
    expect(random).toBeDefined();
    expect(random).toHaveLength(16);
  });
});
