const http = require('../../src/services/__mocks__/httpService');
const config = require('../../src/services/config');
const { initServices, services } = require('../../src/services/index');
const { registerClient } = require('../../src/services/CurrentCivicAnchorServiceImpl');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

initServices(null, http);


const civicAnchor = services.container.CivicAnchor;
jest.setTimeout(100000);

// Reenable when BitGo Interface continues working.
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
    civicAnchor.anchor = jest.fn().mockImplementation(async () => {
      // mock the function or otherwise it would call the server
      return JSON.parse(fs.readFileSync('__test__/creds/fixtures/TempAnchor.json', 'utf8'));
    });
    return civicAnchor.anchor('teste', 'testesdsd').then((result) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
      if (result.type === 'temporary') {
        expect(result).not.toHaveProperty('value');
      } else {
        expect(result).toHaveProperty('value');
      }
    });
  });

  test('Update credential anchor', async (done) => {
    expect.assertions(5);
    civicAnchor.anchor = jest.fn().mockImplementation(async () => {
      // mock the function or otherwise it would call the server
      return JSON.parse(fs.readFileSync('__test__/creds/fixtures/TempAnchor.json', 'utf8'));
    });
    civicAnchor.update = jest.fn().mockImplementation(async () => {
      // mock the function or otherwise it would call the server
      return JSON.parse(fs.readFileSync('__test__/creds/fixtures/PermanentAnchor.json', 'utf8'));
    });
    return civicAnchor.anchor(uuidv4(), uuidv4()).then((result) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
      return result;
    }).then(attestation => civicAnchor.update(attestation)).then((updated) => {
      expect(updated).toBeDefined();
      expect(updated).toHaveProperty('type');
      expect(updated).toHaveProperty('value');
      done();
    });
  });
});
