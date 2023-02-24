// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {findVerificationMethod as bazaarFindVerificationMethod, CachedResolver} from '@digitalbazaar/did-io';
import didSol from '@identity.com/did-io-driver-sol';
import {DIDDocument} from "did-resolver";
import {IDiDResolver} from "./resolver";

const resolver = new CachedResolver();

// no payer needed as we are only resolving documents
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore // TODO: Amend the driver function to accept a nullable payer
resolver.use(didSol.driver({payer: null}));

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
        return this.findVerificationMethod(controllerDocument, verificationMethod) !== null;
    },

    /**
     * Resolves a DID document
     *
     * @param did The DID to resolve the document for
     */
    async resolve(did: string, didResolver: IDiDResolver|undefined) {
        return didResolver ? didResolver.resolve(did) : resolver.get({did});
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

        return bazaarFindVerificationMethod({
            doc: document,
            methodId: verificationMethod,
        });
    }
}
