
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
    const timestamp = new Date().getTime();
    expect.assertions(3);
    return civicAnchor.anchor(`test${timestamp}`, `test${timestamp}`).then((result) => {
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
    const timestamp = new Date().getTime();
    expect.assertions(2);
    const attestation = await civicAnchor.anchor(`test${timestamp}`, `test${timestamp}`);
    expect(attestation).toBeDefined();
    expect(attestation).toHaveProperty('type');
    done();
  });


  test.skip('Poll update until a permanent anchor', () => {
    expect.assertions(5);
    const timestamp = new Date().getTime();
    async function pollUpdate(attestation) {
      const updated = await civicAnchor.update(attestation);
      if (updated.type !== 'permanent') {
        return pollUpdate(updated);
      }
      return updated;
    }

    return civicAnchor.anchor(`teste${timestamp}`, `teste${timestamp}`).then((result) => {
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
