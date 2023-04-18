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

        const newObj = await VerifiableCredential.create({
            identifier: verifiableCredentialJSON.identifier,
            issuer: verifiableCredentialJSON.issuer,
            claims: [],
            evidence: [],
            validate: false,
            subject: '',
        });

        newObj.id = _.clone(verifiableCredentialJSON.id);
        newObj.issuanceDate = _.clone(verifiableCredentialJSON.issuanceDate);
        newObj.expirationDate = _.clone(verifiableCredentialJSON.expirationDate);
        newObj.identifier = _.clone(verifiableCredentialJSON.identifier);
        newObj.type = _.cloneDeep(verifiableCredentialJSON.type);
        newObj.credentialSubject = _.cloneDeep(verifiableCredentialJSON.credentialSubject);
        newObj.proof = _.cloneDeep(verifiableCredentialJSON.proof);

        return newObj;
    }
}
