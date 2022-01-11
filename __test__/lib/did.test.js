const {
  mockDids,
  DID_WITH_NO_DEFAULT,
  DID_SPARSE,
  DID_CONTROLLER,
  DID_CONTROLLED,
} = require('./util/did');
const didUtil = require('../../src/lib/did');

describe('DIDs', () => {
  beforeAll(mockDids);

  it('finds a valid verification method on a DID document', async () => {
    const vm = `${DID_SPARSE}#default`;
    const document = await didUtil.resolve(DID_SPARSE);
    const verificationMethod = didUtil.findVerificationMethod(document, vm);

    expect(verificationMethod).toBeTruthy();
    expect(verificationMethod.id).toBe(vm);
    expect(verificationMethod.controller).toBe(DID_SPARSE);
  });

  it('doesn\'t find a verification that is not in the capabilityInvocation', async () => {
    const vm = `${DID_WITH_NO_DEFAULT}#default`;
    const document = await didUtil.resolve(DID_WITH_NO_DEFAULT);
    const verificationMethod = didUtil.findVerificationMethod(document, vm);

    expect(verificationMethod).toBe(null);
  });

  it('resolves a did:sol document', async () => {
    const document = await didUtil.resolve(DID_SPARSE);

    expect(document).toBeTruthy();
    expect(document.id).toBe(DID_SPARSE);
  });

  it('did has authority to use a key', async () => {
    const hasAuthority = await didUtil.canSign(DID_SPARSE, `${DID_SPARSE}#default`);

    expect(hasAuthority).toBeTruthy();
  });

  it('did doesn\'t have authority to use non-existent key', async () => {
    const hasAuthority = await didUtil.canSign(DID_SPARSE, `${DID_SPARSE}#key2`);

    expect(hasAuthority).toBeFalsy();
  });

  it('did doesn\'t have authority to use a _removed_ default key', async () => {
    const hasAuthority = await didUtil.canSign(DID_WITH_NO_DEFAULT, `${DID_WITH_NO_DEFAULT}#default`);

    expect(hasAuthority).toBeFalsy();
  });

  it('did has authority to use key on controller', async () => {
    const hasAuthority = await didUtil.canSign(DID_CONTROLLED, `${DID_CONTROLLER}#default`);

    expect(hasAuthority).toBeTruthy();
  });
});
