/* eslint-disable @typescript-eslint/no-explicit-any */
import {MerkleProof} from "../../lib/signerVerifier";
import {VerifiableCredential} from "../../vc/VerifiableCredential";

export interface SignerVerifier {
    sign(proof: MerkleProof): Promise<any>;

    verify(vc: VerifiableCredential): Promise<boolean>
}
