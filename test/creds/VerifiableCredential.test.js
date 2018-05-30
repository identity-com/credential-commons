import VC from '../../src/lib/creds/VerifiableCredential';
import UCA from '../../src/lib/uca/UserCollectableAttribute';

describe('VerifiableCredential', () => {
  test('creates new VerifiableCredential', () => {
    const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
    const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('civ:cred:Test', 'jest:test', [name, dob]);
    expect(cred).toBeDefined();
    console.log(JSON.stringify(cred, null, 2));
  });
});
