'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

/**
 * Current Civic Anchor/Attester service
 *
 */
const { cloneDeep } = require('lodash');
const { Verifier, tbsAttestationSubject, Attester, attestationRequest, bitgo, attestationRevocation } = require('chainauth');
const assert = require('assert');

const {
  BitGo, bitcoin: {
    crypto, ECSignature, HDNode
  }
} = bitgo;

/**
 * Civic Anchor/Attester implementation
 *
 * @param {*} config
 * @param {*} http
 */
function CurrentCivicAnchor(config) {
  var _this = this;

  this.config = config;
  this.pollService = _asyncToGenerator(function* () {
    // TODO should we have polling directly from bitgo wallet?
    throw new Error('Not implemented');
  });

  /**
   * Returns an offline attestation locally for fast verification of signing
   * @param label the transaction label
   * @param data the merkle root from our VC
   * @param options keychains prv, the wallet passphrase, the network to spend the funds
   * @returns {Promise<void>} an temp attestation (signature.anchor with type="temporary")
   */
  this.anchor = (() => {
    var _ref2 = _asyncToGenerator(function* (label, data, options) {
      const opts = options || {};
      const keychain = opts.keychain || _this.config.keychain;
      const passphrase = opts.passphrase || _this.config.walletPassphrase;
      const network = opts.network || _this.config.network || 'testnet';

      if (!keychain) {
        throw new Error('Config Error, missing keychain.');
      }
      if (!passphrase) {
        throw new Error('Config Error, missing passphrase.');
      }
      const request = attestationRequest({
        keychain, label, data, passphrase
      });
      const attester = new Attester({
        accessToken: _this.config.accessToken,
        walletId: _this.config.walletId,
        walletPassphrase: _this.config.walletPassphrase,
        network
      });
      return attester.tempAttest(request);
    });

    return function (_x, _x2, _x3) {
      return _ref2.apply(this, arguments);
    };
  })();

  /**
   * Call this method to effectively put the transaction on the chain
   * It can take up to 11 seconds (currently with BitGo implementation) to return the confirmation that is on the chain
   * @param tempAnchor the signature.anchor with type="temporary"
   * @returns {Promise<*>} returns the VC with the newly signed anchoring and Merkle Root on the chain
   */
  this.update = (() => {
    var _ref3 = _asyncToGenerator(function* (tempAnchor) {
      if (tempAnchor.type === 'temporary') {
        const attester = new Attester({
          accessToken: _this.config.accessToken,
          walletId: _this.config.walletId,
          walletPassphrase: _this.config.walletPassphrase,
          network: tempAnchor.network
        });
        const transactions = yield attester.multiAttest({
          requests: [tempAnchor]
        });
        return transactions[0];
      }
      return _this;
    });

    return function (_x4) {
      return _ref3.apply(this, arguments);
    };
  })();

  /**
   * This method checks if the signature matches for the root of the Merkle Tree
   * @return true or false for the validation
   */
  this.verifySignature = signature => {
    // avoid anchor tampering
    const subject = signature.anchor.subject;
    const anchorSubjectValidation = this.verifySubjectSignature(subject);
    // double check if the subject data equals the anchor merkle root
    const subjectMerkleRoot = cloneDeep(subject);
    subjectMerkleRoot.data = signature.merkleRoot;
    const merkleRootSignatureValidation = this.verifySubjectSignature(subjectMerkleRoot);
    return anchorSubjectValidation && merkleRootSignatureValidation;
  };

  /**
   * This method checks if the subject signature matches the pub key
   * @param subject a json with label, data, signature, pub
   * @returns {*} true or false for the validation
   */
  this.verifySubjectSignature = subject => {
    const hash = crypto.sha256(tbsAttestationSubject(subject));
    const subjectSignature = ECSignature.fromDER(Buffer.from(subject.signature, 'hex'));
    return HDNode.fromBase58(subject.pub).keyPair.verify(hash, subjectSignature);
  };

  /**
   * This method checks that the attestation / anchor exists on the BC
   */
  this.verifyAttestation = (() => {
    var _ref4 = _asyncToGenerator(function* (signature) {
      let validation = false;
      if (signature.anchor.type === 'permanent' && !signature.anchor.subject.value) {
        const bitgoEnv = signature.anchor.network === 'testnet' ? 'test' : 'prod';
        const verifier = new Verifier({
          env: bitgoEnv,
          coin: signature.anchor.coin,
          accessToken: process.env.ACCESS_TOKEN,
          offline: false
        });
        validation = yield verifier.verify(signature.anchor);
      }
      return validation;
    });

    return function (_x5) {
      return _ref4.apply(this, arguments);
    };
  })();

  /**
   * Revoke the attestation by spending it's funds
   * @param signature the VC signature part (with the anchor)
   * @returns {Promise<*>} an promise that verifies the funds on the chain confirming the revocation
   */
  this.revokeAttestation = (() => {
    var _ref5 = _asyncToGenerator(function* (signature) {
      // TODO we have to get civic keychain from an endpoint
      const keychains = [{ prv: process.env.CIVIC_KEYCHAIN }];
      const wallet = yield _this.getWalletHandle(signature.anchor, process.env.CLIENT_ACCESS_TOKEN);
      yield _this.revokeAttestationWithWalletAndCosigner(wallet, signature.anchor, keychains);
      return _this.verifyFundsSpent(signature.anchor);
    });

    return function (_x6) {
      return _ref5.apply(this, arguments);
    };
  })();

  /**
   * Check that an VC is revoked by going to chain and checking if the funds of the UTXO were spent
   * @param signature
   * @returns {Promise<*>}
   */
  this.isRevoked = (() => {
    var _ref6 = _asyncToGenerator(function* (signature) {
      return _this.verifyFundsSpent(signature.anchor);
    });

    return function (_x7) {
      return _ref6.apply(this, arguments);
    };
  })();

  /**
   * Method to check the funds of an UTXO. Retries 10 times by default, if no unspent found than it will fail
   * If unspent is found check the funds
   * @param attestation the attestation to check signature.anchor from VC
   * @param retries how many retries should the method do, 10 by default
   * @returns {Promise<T>} true | false if the funds were spent or not
   */
  this.verifyFundsSpent = (() => {
    var _ref7 = _asyncToGenerator(function* (attestation, retries = 10) {
      // Verify that the funds at the address are spent, effectively revoking the attestation
      // Note - the retries value passed to Verifier is 0, as we are testing the opposite of verify
      // namely, if verify succeeds, we retry, if it fails, we stop immediately
      const verifier = new Verifier({ retries: 0 });
      let remainingRetries = retries;
      const retry = function () {
        if (remainingRetries) {
          remainingRetries -= 1;
          return verifier.verify(attestation).then(new Promise(function (resolve) {
            return setTimeout(resolve, 1000 * (remainingRetries > 0 ? 1 : 0));
          })).then(retry);
        }
        return true;
      };
      // if verification succeeds (i.e. the unspents are still unspent
      // then revocation fails. Retry a few times and then fail out
      return retry().then(assert.fail).catch(function (err) {
        // if verification fails (for the right reason) then the revocation was successful
        if (err.toString() === 'Error: Unspent not found in blockchain') {
          return true;
        }
        return false;
      });
    });

    return function (_x8) {
      return _ref7.apply(this, arguments);
    };
  })();

  /**
   * Revoke the attestation by spending the funds for the transaction, the wallet and keychains Civic|BitGo|Client are
   * needed to sign the transaction
   * @param wallet use getWalletHandle method to get this wallet
   * @param attestation signature.anchor from the VC
   * @param keychains Civic|BitGo|Client for signing the transaction
   * @returns {Promise<boolean>} true if the transaction was sent to the BC, fails otherwise
   */
  this.revokeAttestationWithWalletAndCosigner = (() => {
    var _ref8 = _asyncToGenerator(function* (wallet, attestation, keychains) {
      // Prepare revocation tx
      const { revocation } = attestationRevocation({
        attestation,
        keychains,
        amount: Attester.DUST_THRESHOLD_SATOSHIS + 1
      });
      // Get cosigned, broadcast by wallet provider
      yield wallet.submitTransaction({ txHex: revocation });
      return true;
    });

    return function (_x9, _x10, _x11) {
      return _ref8.apply(this, arguments);
    };
  })();

  /**
   * Bitgo auxiliary method to get the wallet of the client
   * @param attestation
   * @param accessToken
   * @returns {Promise<*>}
   */
  this.getWalletHandle = (() => {
    var _ref9 = _asyncToGenerator(function* (attestation, accessToken) {
      const bitgoEnv = attestation.network === 'testnet' ? 'test' : 'prod';
      const sdk = new BitGo({ accessToken, env: bitgoEnv });
      const { walletId: id } = attestation;
      return sdk.coin(attestation.coin).wallets().get({ id });
    });

    return function (_x12, _x13) {
      return _ref9.apply(this, arguments);
    };
  })();

  return this;
}

module.exports = {
  CurrentCivicAnchor
};