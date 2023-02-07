const sjcl = require('sjcl');
const MiniCryptoManagerImpl = require('services/MiniCryptoManagerImpl');

const XPVT = 'xprvA1yULd2DFYnQRVbLiAKrFdftVLsANiC3rqLvp8iiCbnchcWqd6kJPoaV3sy7R6CjHM8RbpoNdWVgiPZLVa1EmneRLtwiitNpWgwyVmjvay7'; // eslint-disable-line
const XPUB = 'xpub6Expk8Z75vLhdyfopBrrcmcd3NhenAuuE4GXcX8KkwKbaQqzAe4Ywbtxu9F95hRHj79PvdtYEJcoR6gesbZ79fS4bLi1PQtm81rjxAHeLL9'; // eslint-disable-line

describe('Unit tests for MiniCryptoManager', () => {
  let cryptoManagerImpl;

  beforeAll(async (done) => {
    cryptoManagerImpl = new MiniCryptoManagerImpl();
    done();
  });

  test('Should sign with XPVT key and verify with XPUB pair', async (done) => {
    const nonce = new Date().getTime();
    const stringWithNonce = `SomeStringWithNonce${nonce}`;
    const hexHashNonce = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(stringWithNonce));

    const keyNameSign = 'KeyNameToSign';
    cryptoManagerImpl.installKey(keyNameSign, XPVT);

    const hexSignature = cryptoManagerImpl.sign(keyNameSign, hexHashNonce);
    expect(hexSignature).toBeDefined();

    const stringWithNonceToVerify = `SomeStringWithNonce${nonce}`;
    const hexHashNonceToVerify = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(stringWithNonceToVerify));

    const keyNameVerify = 'KeyNameToVerify';
    cryptoManagerImpl.installKey(keyNameVerify, XPUB);

    const verify = cryptoManagerImpl.verify(keyNameVerify, hexHashNonceToVerify, hexSignature);
    expect(verify).toEqual(true);
    done();
  });
});
