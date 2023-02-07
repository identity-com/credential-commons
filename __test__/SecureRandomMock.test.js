const SecureRandom = require('SecureRandom');
// jest babel hoist the mock to the top of the file
// do not mock the other SecureRandom.test.js or else you won't be able to unmock
jest.mock('crypto');
describe('Secure Random Tests', () => {
  it('should fail since we are mocking the crypto class', () => {
    const secureRandom = new SecureRandom();
    expect(() => secureRandom.wordWith(16)).toThrow();
  });
});
