const fs = require('fs');

describe('Config tests', () => {
  it('Should validate that it\'s not a node environment', () => {
    const processEnvNodeBefore = process.env.NODE_ENV;
    process.env.APP_ENV = 'browser';
    // there is no other way to bypass a require process.env
    // eslint-disable-next-line no-trailing-spaces,global-require
    const config = require('services/config');
    expect(config).toBeDefined();
    process.env.NODE_ENV = processEnvNodeBefore;
  });

  it('Should force an non existent config file', () => {
    fs.existsSync = jest.fn(() => null);
    // eslint-disable-next-line no-trailing-spaces,global-require
    const config = require('services/config');
    expect(config).toBeDefined();
  });
});
