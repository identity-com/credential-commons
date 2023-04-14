import {VerificationMethod} from "did-resolver";

export interface SignerVerifier<D, R> {
    sign(data: D, vm: VerificationMethod): Promise<R>;
    verify(data: D, vm: VerificationMethod): Promise<boolean>;
}
