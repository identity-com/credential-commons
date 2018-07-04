/**
 * Current Civic Anchor/Attester service
 *
 */
const { cloneDeep } = require('lodash');
const { Verifier, tbsAttestationSubject, Attester, attestationRequest, bitgo } = require('chainauth');

const {
  BitGo, bitcoin: {
    crypto, ECSignature, HDNode,
  },
} = bitgo;

/**
 * Civic Anchor/Attester implementation
 *
 * @param {*} config
 * @param {*} http
 */
function CurrentCivicAnchor(config) {
  this.config = config;
  this.pollService = async () => {
    // TODO should we have polling directly from bitgo wallet?
    throw new Error('Not implemented');
  };

  this.anchor = async (label, data, options) => {
    const opts = options || {};
    const keychain = opts.keychain || this.config.keychain;
    const passphrase = opts.passphrase || this.config.walletPassphrase;
    const network = opts.network || this.config.network || 'testnet';

    if (!keychain) {
      throw new Error('Config Error, missing keychain.');
    }
    if (!passphrase) {
      throw new Error('Config Error, missing passphrase.');
    }
    const request = attestationRequest({
      keychain, label, data, passphrase,
    });
    const attester = new Attester({
      accessToken: this.config.accessToken,
      walletId: this.config.walletId,
      walletPassphrase: this.config.walletPassphrase,
      network,
    });
    return attester.tempAttest(request);
  };

  this.update = async (tempAnchor) => {
    if (tempAnchor.type === 'temporary') {
      const attester = new Attester({
        accessToken: this.config.accessToken,
        walletId: this.config.walletId,
        walletPassphrase: this.config.walletPassphrase,
        network: tempAnchor.network,
      });
      const transactions = await attester.multiAttest({
        requests: [tempAnchor],
      });
      return transactions[0];
    }
    return this;
  };

  /**
   * This method checks if the signature matches for the root of the Merkle Tree
   * @return true or false for the validation
   */
  this.verifySignature = (signature) => {
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
  this.verifySubjectSignature = (subject) => {
    const hash = crypto.sha256(tbsAttestationSubject(subject));
    const subjectSignature = ECSignature.fromDER(Buffer.from(subject.signature, 'hex'));
    return HDNode.fromBase58(subject.pub).keyPair.verify(hash, subjectSignature);
  };

  /**
   * This method checks that the attestation / anchor exists on the BC
   */
  this.verifyAttestation = async (signature) => {
    if (signature.anchor.type === 'permanent' && !signature.anchor.subject.value) {
      const bitgoEnv = signature.anchor.network === 'testnet' ? 'test' : 'prod';
      const verifier = new Verifier({
        env: bitgoEnv,
        coin: signature.anchor.coin,
        accessToken: process.env.ACCESS_TOKEN,
        offline: false,
      });
      const validation = await verifier.verify(signature.anchor);
      return validation;
    }
    return false;
  };

  return this;
}

module.exports = {
  CurrentCivicAnchor,
}
;
