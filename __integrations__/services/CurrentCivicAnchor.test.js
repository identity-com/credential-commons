const uuidv4 = require('uuid/v4');
const { services } = require('../../src/services/index');
const { registerClient } = require('../../src/services/CurrentCivicAnchorServiceImpl');

const civicAnchor = services.container.CivicAnchor;
jest.setTimeout(200000);

describe('Civic Anchor Module Tests', () => {
  // We don't want to run register a new client on every test
  test('Register as a valid client', async (done) => {
    expect.assertions(4);
    return registerClient(services.container.Http).then((result) => {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('signingKeys.hexpub');
      expect(result).toHaveProperty('signingKeys.hexsec');
      expect(result).not.toHaveProperty('encryptionKeys');
      done();
    });
  });

  test('Anchor new credential', () => {
    expect.assertions(3);
    return civicAnchor.anchor(uuidv4(), uuidv4()).then((result) => {
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
    expect.assertions(2);
    const attestation = await civicAnchor.anchor(uuidv4(), uuidv4());
    expect(attestation).toBeDefined();
    expect(attestation).toHaveProperty('type');
    done();
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

    return civicAnchor.anchor(uuidv4(), uuidv4()).then((result) => {
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
