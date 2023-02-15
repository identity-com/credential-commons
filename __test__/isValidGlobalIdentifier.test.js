const isGlobalIdentifier = require('isValidGlobalIdentifier');
const { schemaLoader, CVCSchemaLoader } = require('index');

describe('isGlobalIdentifier Tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  test('name-v1 is malformed', () => expect(isGlobalIdentifier('name-v1'))
    .rejects.toThrow(/Malformed Global Identifier/));

  test('credentialItem-civ:Identity:firstName-1 has invalid prefix',
    () => expect(isGlobalIdentifier('credentialItem-civ:Identity:firstName-1'))
      .rejects.toThrow(/Invalid Global Identifier Prefix/));

  test('claim-civ:Identity:firstNome-1 is invalid',
    () => expect(isGlobalIdentifier('claim-civ:Identity:firstNome-1'))
      .rejects.toThrow(/claim-civ:Identity:firstNome-1 is not valid/));

  test('credential-civ:Credential:CivicBasico-1 is invalid',
    () => expect(isGlobalIdentifier('credential-civ:Credential:CivicBasico-1'))
      .rejects.toThrow(/credential-civ:Credential:CivicBasico-1 is not valid/));

  test('claim-cvc:Name.givenNames-v1 is valid', async () => {
    expect(await isGlobalIdentifier('claim-cvc:Name.givenNames-v1')).toBeTruthy();
  });

  test('credential-cvc:Identity-v1 is valid', async () => {
    expect(await isGlobalIdentifier('credential-cvc:Identity-v1')).toBeTruthy();
  });

  test('credential-cvc:IDVaaS-v1 is valid', async () => {
    expect(await isGlobalIdentifier('credential-cvc:IDVaaS-v1')).toBeTruthy();
  });

  test('credential-cvc:IdDocument-v1 is valid', async () => {
    expect(await isGlobalIdentifier('credential-cvc:IdDocument-v1')).toBeTruthy();
  });
});
