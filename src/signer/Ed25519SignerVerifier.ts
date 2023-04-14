import {SignerVerifier} from "./SignerVerifier";
import {VerificationMethod} from "did-resolver";

export class Ed25519SignerVerifier implements SignerVerifier<string, string> {
    constructor(private _encoding: 'UTF-8' | 'hex' = 'hex', private _key: string) {
    }
    sign(data: any, vm: VerificationMethod): Promise<any> {
        return Promise.resolve(undefined);
    }

    verify(data: any, vm: VerificationMethod): Promise<boolean> {
        return Promise.resolve(false);
    }
}
