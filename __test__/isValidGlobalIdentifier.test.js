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
  test('claim-civ:Identity:firstNome-1 is invalid', () => {
    function target() {
      isGlobalIdentifier('claim-civ:Identity:firstNome-1');
    }
    expect(target).toThrow('claim-civ:Identity:firstNome-1 is not valid');
  });
  test('credential-civ:Credential:CivicBasico-1 is invalid', () => {
    function target() {
      isGlobalIdentifier('credential-civ:Credential:CivicBasico-1');
    }
    expect(target).toThrow('credential-civ:Credential:CivicBasico-1 is not valid');
  });
  test('claim-cvc:Name.givenNames-v1 is valid', () => {
    expect(isGlobalIdentifier('claim-cvc:Name.givenNames-v1')).toBeTruthy();
  });
  test('credential-cvc:Identity-v1 is valid', () => {
    expect(isGlobalIdentifier('credential-cvc:Identity-v1')).toBeTruthy();
  });
});
