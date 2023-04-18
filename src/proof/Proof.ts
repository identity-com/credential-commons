import _ from 'lodash';
import {VerifiableCredential} from "../vc/VerifiableCredential";
import {schemaLoader} from "../schemas/jsonSchema";

export default interface Proof<K> {
    sign(credential: VerifiableCredential, key: K): Promise<VerifiableCredential>;

    verify(credential: VerifiableCredential): Promise<boolean>
}

export abstract class AbstractProof<K> implements Proof<K> {
    abstract sign(credential: VerifiableCredential, key: K): Promise<VerifiableCredential>;

    abstract verify(verifiableCredentialJSON: VerifiableCredential): Promise<boolean>;

    static async vcFromJSON(
        verifiableCredentialJSON: VerifiableCredential,
        partialPresentation = false
    ): Promise<VerifiableCredential> {
        await schemaLoader.loadSchemaFromTitle(verifiableCredentialJSON.identifier);

        if (!verifiableCredentialJSON.identifier) {
            throw new Error('No identifier found on the credential');
        }

        if (!partialPresentation) {
            await schemaLoader.validateSchema(verifiableCredentialJSON.identifier, verifiableCredentialJSON);
        }

        const verifiableCredential = await VerifiableCredential.create({
            identifier: verifiableCredentialJSON.identifier,
            issuer: verifiableCredentialJSON.issuer,
            claims: [],
            evidence: [],
            validate: false,
            subject: '',
        });

        verifiableCredential.id = _.clone(verifiableCredentialJSON.id);
        verifiableCredential.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
        verifiableCredential.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
        verifiableCredential.identifier = _.clone(verifiableCredentialJSON.identifier);
        verifiableCredential.type = _.cloneDeep(verifiableCredentialJSON.type);
        verifiableCredential.credentialSubject = _.cloneDeep(verifiableCredentialJSON.credentialSubject);
        verifiableCredential.proof = _.cloneDeep(verifiableCredentialJSON.proof);

        return verifiableCredential;
    }
}
