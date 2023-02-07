const {
  mockDids,
  DID_WITH_NO_DEFAULT,
  DID_SPARSE,
  DID_CONTROLLER,
  DID_CONTROLLED,
} = require('./util/did');
const didUtil = require('lib/did');

describe('DIDs', () => {
  beforeAll(mockDids);

  it('resolves a did:sol document', async () => {
    const document = await didUtil.resolve(DID_SPARSE);

    expect(document).toBeTruthy();
    expect(document.id).toBe(DID_SPARSE);
  });

  it('finds a valid verification method on a DID document', async () => {
    const vm = `${DID_SPARSE}#default`;
    const document = await didUtil.resolve(DID_SPARSE);
    const verificationMethod = didUtil.findVerificationMethod(document, vm);

    expect(verificationMethod).toBeTruthy();
    expect(verificationMethod.id).toBe(vm);
    expect(verificationMethod.controller).toBe(DID_SPARSE);
  });

  it('doesn\'t find a verification that is not valid on the document', async () => {
    const vm = `${DID_WITH_NO_DEFAULT}#default`;
    const document = await didUtil.resolve(DID_WITH_NO_DEFAULT);
    const verificationMethod = didUtil.findVerificationMethod(document, vm);

    expect(verificationMethod).toBe(null);
  });

  it('verificationMethod can sign for a DID', async () => {
    const canSign = await didUtil.canSign(DID_SPARSE, `${DID_SPARSE}#default`);

    expect(canSign).toBeTruthy();
  });

  it('verificationMethod can not sign for a DID if the key does not exist', async () => {
    const canSign = await didUtil.canSign(DID_SPARSE, `${DID_SPARSE}#key2`);

    expect(canSign).toBeFalsy();
  });

  it('verificationMethod can not sign for a DID where the default key is removed', async () => {
    const canSign = await didUtil.canSign(DID_WITH_NO_DEFAULT, `${DID_WITH_NO_DEFAULT}#default`);

    expect(canSign).toBeFalsy();
  });

  it('verificationMethod can sign for a DID it is a controller of', async () => {
    const canSign = await didUtil.canSign(DID_CONTROLLED, `${DID_CONTROLLER}#default`);

    expect(canSign).toBeTruthy();
  });
});
