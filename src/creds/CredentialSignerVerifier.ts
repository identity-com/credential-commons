import _ from 'lodash'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {HDNode, ECSignature} from 'bitcoinjs-lib';
import {MerkleProof, VerifiableMerkleCredential} from '../lib/signerVerifier';
import {Buffer} from 'buffer';

const SIGNATURE_ALGO = 'ec256k1';

interface CredentialSignerVerifierOptions {
    keyPair: KeyPair,
    prvBase58: string,
    pubBase58: string
}

interface KeyPair {
    verify(buffer: Buffer, signature: Signature): boolean

    sign(buffer: Buffer): Signature;

    neutered(): { toBase58(): string }
}

interface Signature {
    toDER(): Buffer
}

class CredentialSignerVerifier {
    private readonly keyPair: KeyPair;

    /**
     * Creates a new instance of a CredentialSignerVerifier
     *
     * @param options.keyPair any instance that implements sign and verify interface
     * or
     * @param options.prvBase58 bse58 serialized private key
     * or for verification only
     * @param options.pubBase58 bse58 serialized public key
     */
    constructor(options: CredentialSignerVerifierOptions) {
        if (_.isEmpty(options.keyPair) && _.isEmpty(options.prvBase58) && _.isEmpty(options.pubBase58)) {
            throw new Error('Either a keyPair, prvBase58 or pubBase58(to verify only) is required');
        }
        this.keyPair = options.keyPair || HDNode.fromBase58(options.prvBase58 || options.pubBase58);
    }

    /**
     * Verify is a credential has a valid merkletree signature, using a pinned pubkey
     * @param credential
     * @returns {*|boolean}
     */
    isSignatureValid(credential: VerifiableMerkleCredential) {
        if (_.isEmpty(credential.proof)
            || _.isEmpty(credential.proof.merkleRoot)
            || _.isEmpty(credential.proof.merkleRootSignature)) {
            throw Error('Invalid Credential Proof Schema');
        }

        try {
            const signatureHex = _.get(credential, 'proof.merkleRootSignature.signature');
            const signature = signatureHex ? ECSignature.fromDER(Buffer.from(signatureHex, 'hex')) : null;
            const merkleRoot = _.get(credential, 'proof.merkleRoot');
            return (signature && merkleRoot) ? this.keyPair.verify(Buffer.from(merkleRoot, 'hex'), signature) : false;
        } catch (error) {
            // verify throws in must cases but we want to return false
            return false;
        }
    }

    /**
     * Create a merkleRootSignature object by signing with a pinned private key
     * @param proof
     * @returns {{signature, pubBase58: *, algo: string}}
     */
    sign(proof: MerkleProof) {
        const hash = Buffer.from(proof.merkleRoot, 'hex');
        const signature = this.keyPair.sign(hash);
        return {
            algo: SIGNATURE_ALGO,
            pubBase58: this.keyPair.neutered().toBase58(),
            signature: signature.toDER().toString('hex'),
        };
    }
}

export = CredentialSignerVerifier