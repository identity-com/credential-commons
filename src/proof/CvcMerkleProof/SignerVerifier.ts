import {MerkleProof} from "../../lib/signerVerifier";
import {VerificationMethod} from "did-resolver";
import {VerifiableCredential} from "../../vc/VerifiableCredential";

export interface SignerVerifier {
    sign(proof: MerkleProof): Promise<any>;

    verify(vc: VerifiableCredential): Promise<boolean>
}
