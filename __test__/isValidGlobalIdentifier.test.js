const isGlobalIdentifier = require('../src/isValidGlobalIdentifier');

describe('isGlobalIdentifier Tests', () => {
  test('name-v1 is malformed', () => {
    function target() {
      isGlobalIdentifier('name-v1');
    }
    expect(target).toThrow('Malformed Global Identifier');
  });
  test('credentialItem-civ:Identity:firstName-1 has invalid prefix', () => {
    function target() {
      isGlobalIdentifier('credentialItem-civ:Identity:firstName-1');
    }
    expect(target).toThrow('Invalid Global Identifier Prefix');
  });
  test('claim-civ:Identity:firstName-1 is valid', () => {
    expect(isGlobalIdentifier('claim-civ:Identity:firstName-1')).toBeTruthy();
  });
  test('credential-civ:Credential:CivicBasic-1 is valid', () => {
    expect(isGlobalIdentifier('credential-civ:Credential:CivicBasic-1')).toBeTruthy();
  });
});
