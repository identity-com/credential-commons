const http = require('../../src/services/__mocks__/httpService');
const config = require('../../src/services/config');
const { initServices, services } = require('../../src/services/index');
const { registerClient } = require('../../src/services/CurrentCivicAnchorServiceImpl');

initServices(null, http);


const civicAnchor = services.container.CivicAnchor;
jest.setTimeout(100000);

describe('Civic Anchor Module Tests', () => {
  // We don't want to run register a new client on every test 
  test('Register as a valid client', () => {
    expect.assertions(4);
    return registerClient(http, config).then((result) => {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('signingKeys.hexpub');
      expect(result).toHaveProperty('signingKeys.hexsec');
      expect(result).not.toHaveProperty('encryptionKeys');
    });
  });

  test('Anchor new credential', () => {
    expect.assertions(3);
    return civicAnchor.anchor('teste', 'testesdsd').then((result) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
      if (result.type === 'temporary') {
        expect(result).toHaveProperty('statusUrl');
      } else {
        expect(result).not.toHaveProperty('statusUrl');
      }
    });
  });

  test('Update credential anchor', () => {
    expect.assertions(4);
    return civicAnchor.anchor('teste', 'testesdsd').then((result) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
      return result;
    }).then(attestaion => civicAnchor.update(attestaion)).then((updated) => {
      expect(updated).toBeDefined();
      expect(updated).toHaveProperty('type');
    });
  });
});
