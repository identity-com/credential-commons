/* eslint-disable max-len */

const { HDNode } = require('bitcoinjs-lib');
const CredentialSignerVerifier = require('creds/CredentialSignerVerifier');

const SEED = 'f6d466fd58c20ff964673522083efebf';
const prvBase58 = 'xprv9s21ZrQH143K4aBUwUW6GVec7Y6oUEBqrt2WWaXyxjh2pjofNc1of44BLufn4p1t7Jq4EPzm5C9sRxCuBYJdHu62jhgfyPm544sNjtH7x8S';

const pubBase58 = 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD';

describe('CredentialSignerVerifier Tests', () => {
  describe('Using a ECKeyPair', () => {
    let keyPair;
    let signerVerifier;

    beforeAll(() => {
      keyPair = HDNode.fromSeedHex(SEED);
      signerVerifier = new CredentialSignerVerifier({ keyPair });
    });

    it('Should sign and verify', () => {
      const toSign = { merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' };
      const signature = signerVerifier.sign(toSign);
      expect(signature).toBeDefined();
      const toVerify = {
        proof: {
          ...toSign,
          merkleRootSignature: signature,
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeTruthy();
    });

    it('Should verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: '3045022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };

      expect(signerVerifier.isSignatureValid(toVerify)).toBeTruthy();
    });

    it('Should not verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: 'fa3e022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeFalsy();
    });
  });
  describe('Using a prvBase58', () => {
    let signerVerifier;

    beforeAll(() => {
      signerVerifier = new CredentialSignerVerifier({ prvBase58 });
    });

    it('Should sign and verify', () => {
      const toSign = { merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' };
      const signature = signerVerifier.sign(toSign);
      expect(signature).toBeDefined();
      const toVerify = {
        proof: {
          ...toSign,
          merkleRootSignature: signature,
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeTruthy();
    });

    it('Should verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: '3045022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeTruthy();
    });

    it('Should not verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: 'fa3e022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeFalsy();
    });
  });
  describe('Using a pubBase58', () => {
    let signerVerifier;

    beforeAll(() => {
      signerVerifier = new CredentialSignerVerifier({ pubBase58 });
    });

    it('Should verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: '3045022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeTruthy();
    });

    it('Should not verify', () => {
      const toVerify = {
        proof: {
          merkleRoot: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b666',
          merkleRootSignature: {
            algo: 'ec256k1',
            pubBase58: 'xpub661MyMwAqRbcH4Fx3W36ddbLfZwHsguhE6x7JxwbX5E1hY8ov9L4CrNfCCQpV8pVK64CVqkhYQ9QLFgkVAUqkRThkTY1R4GiWHNZtAFSVpD',
            signature: 'fa3e022100e7f0921491e8da2759b24047443325483ac023795683dc3b91c78d0566a1159602206fd4e80982fd83705932543d02bc6abd079446bf4ec7b5d9fba4f7f5363bd6fa',
          },
        },
      };
      expect(signerVerifier.isSignatureValid(toVerify)).toBeFalsy();
    });
  });
});
