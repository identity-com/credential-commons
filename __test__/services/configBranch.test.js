// do not put these tests on the same file as config.test.js or else jest will fail coverage (describe.beforeEach scope not working)
describe('Test process platform', () => {
  beforeEach(() => {
    this.originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'win32',
    });
  });

  it('Should validate that it is in windows', () => {
    // it's not linting because we need to test branching of this config file
    try {
      // eslint-disable-next-line no-trailing-spaces,global-require
      require('../../src/services/config');
    } catch (err) {
      expect(err.message).toBe('Unsupported platform: win32');
    }
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: this.originalPlatform,
    });
  });
});
