import nacl from "tweetnacl";
import {MerkleProof, VerifiableMerkleCredential} from "../../lib/signerVerifier";
import {SignerVerifier} from "./SignerVerifier";
import {IDiDResolver} from "../../lib/resolver";
import {Keypair} from "@solana/web3.js";
import {VerifiableCredential} from "../../vc/VerifiableCredential";
import didUtil from "../../lib/did";
import bs58 from "bs58";

export class Ed25519SignerVerifier implements SignerVerifier {
    constructor(private _didResolver: IDiDResolver, private _verificationMethod: string, private _keypair: Keypair) {
    }

    async sign(proof: MerkleProof): Promise<any> {
        if (!this._keypair) throw new Error(`No private key provided for signing`);

        const signed = nacl.sign.detached(Buffer.from(proof.merkleRoot, 'hex'), this._keypair.secretKey);
        const signature = Buffer.from(signed).toString('hex');

        return Promise.resolve({
            signature,
            verificationMethod: this._verificationMethod,
        });
    }

    async verify(vc: VerifiableCredential): Promise<boolean> {
        const did = await didUtil.resolve(vc.issuer, this._didResolver);
        if (!did) throw new Error(`Unable to resolve document for ${vc.issuer}`);

        const vm = await didUtil.findVerificationMethod(did, this._verificationMethod);

        if(!vm) throw new Error(`Verification method ${this._verificationMethod} not found on did ${vc.issuer}`);

        return this.verifyEncoding(vc, vm.publicKeyBase58, 'hex') || this.verifyEncoding(vc, vm.publicKeyBase58, 'utf-8');
    }

    /**
     * Verifies a VC that was signed with a specific encoding
     */
    private verifyEncoding(vc: VerifiableCredential, key: string, encoding: BufferEncoding) {
        return nacl.sign.detached.verify(
            Buffer.from(vc.proof.merkleRoot, encoding),
            Uint8Array.from(Buffer.from(vc.proof.merkleRootSignature.signature, 'hex')),
            bs58.decode(key),
        );
    }

    //
    // sign(proof: MerkleProof, key: string, verificationMethod: VerificationMethod) {
    //     const signed = nacl.sign.detached(Buffer.from(proof.merkleRoot, 'hex'), bs58.decode(key));
    //     const signature = Buffer.from(signed).toString('hex');
    //
    //     return {
    //         signature,
    //         verificationMethod,
    //     };
    // }
}
