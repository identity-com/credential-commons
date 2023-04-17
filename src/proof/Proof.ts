import {VerifiableCredential} from "../vc/VerifiableCredential";

export default interface Proof<K> {
    sign(credential: VerifiableCredential, key: K): Promise<VerifiableCredential>;

    verify(credential: VerifiableCredential): Promise<boolean>
}
