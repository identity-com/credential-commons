// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {DIDDocument, } from "did-resolver";
import {IDiDResolver} from "./resolver";
import {DidSolIdentifier, DidSolService} from "@identity.com/sol-did-client";
import {findVerificationMethod} from "./did/findVerificationMethod";

const resolveSolDid = (did: string): Promise<DIDDocument> => {
    return DidSolService.build(
        DidSolIdentifier.parse(did),
    ).resolve()
}

export = {
    /**
     * Checks if a verificationMethod can sign for the DID document
     *
     * @param didOrDocument A DID (string) or DIDDocument (object)
     * @param verificationMethod The verification method to check
     * @returns {Promise<boolean>} True if the verification method can sign
     */
    async canSign(didOrDocument: string | DIDDocument, verificationMethod: string, didResolver: IDiDResolver|undefined) {
        const [verificationMethodDid] = verificationMethod.split('#');
        const document = typeof didOrDocument === 'string' ? (await this.resolve(didOrDocument, didResolver)) : didOrDocument;

        if(!document) {
            throw new Error("Unable to resolve document");
        }

        const did = document.id;

        // if the verificationMethod DID is for the document DID
        if (verificationMethodDid === did) {
            return this.findVerificationMethod(document, verificationMethod) !== null;
        }

        if (!document.controller || !document.controller.includes(verificationMethodDid)) {
            // If the verification method DID is not a controller of the provided DID
            return false;
        }

        // Check if the verificationMethod exists on the controller DID document
        const controllerDocument = await this.resolve(verificationMethodDid, didResolver);

        if(!controllerDocument) {
            throw new Error(`Unable to resolve document for ${verificationMethodDid}`);
        }


        return this.findVerificationMethod(controllerDocument, verificationMethod) !== null;
    },

    /**
     * Resolves a DID document
     *
     * @param did The DID to resolve the document for
     */
    async resolve(did: string, didResolver: IDiDResolver|undefined) {
        return didResolver ? didResolver.resolve(did) : (await resolveSolDid(did));
    },

    /**
     * Finds the verificationMethod in a document
     *
     * @param document The document to search through
     * @param verificationMethod The verification method to return
     */
    findVerificationMethod(document: DIDDocument, verificationMethod: string) {
        if (document.keyAgreement && document.keyAgreement.length > 0) {
            return document.keyAgreement.find(agreement => {
                // TODO: Remove this check as part of IDCOM-2323
                if(typeof agreement === "string") {
                    return agreement == verificationMethod
                }

                return agreement.id === verificationMethod;
            });
        }

        if (!document.capabilityInvocation?.includes(verificationMethod)) {
            return null;
        }

        return findVerificationMethod({
            doc: document,
            methodId: verificationMethod,
            purpose: null
        });
    }
}
