const CredentialCommons = require('../src/index');
const httpMock = require('../src/services/__mocks__/httpService');

describe('Module Entry Point Tests', () => {
  it('should access the entry point e see if the modules are declared', () => {
    const UCA = CredentialCommons.UCA;
    const VC = CredentialCommons.VC;
    const confMock = {
      sipSecurityService: '',
      attestationService: '',
      clientConfig: {
        id: '',
        signingKeys: {
          hexpub: '',
          hexsec: '',
        },
      },
      passphrase: '',
      keychain: { prv: '' },
    };
    CredentialCommons.init(confMock, httpMock);
    expect(UCA).toBeDefined();
    expect(VC).toBeDefined();
  });
});
