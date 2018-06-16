
const { services } = require('../../src/services/index');
const { registerClient } = require('../../src/services/CurrentCivicAnchorServiceImpl');

const civicAnchor = services.container.CivicAnchor;
jest.setTimeout(100000);

describe('Civic Anchor Module Tests', () => {
  // We don't want to run register a new client on every test 
  test.skip('Register as a valid client', () => {
    expect.assertions(4);
    return registerClient(services.container.Http).then((result) => {
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
    }).then(attestation => civicAnchor.update(attestation)).then((updated) => {
      expect(updated).toBeDefined();
      expect(updated).toHaveProperty('type');
    });
  });


  test('Poll update until a permanent anchor', () => {
    expect.assertions(5);

    async function pollUpdate(attestation) {
      const updated = await civicAnchor.update(attestation);
      if (updated.type !== 'permanent') {
        return pollUpdate(updated);
      }
      return updated;
    }

    return civicAnchor.anchor('teste', 'testesdsd').then((result) => {
      expect(result).toBeDefined();
      expect(result).toHaveProperty('type');
      return result;
    }).then(attestation => pollUpdate(attestation)).then((updated) => {
      expect(updated).toBeDefined();
      expect(updated).toHaveProperty('type');
      expect(updated.type).toBe('permanent');
    });
  });
});
