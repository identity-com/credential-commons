// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {DIDDocument} from "did-resolver";
import {IDiDResolver} from "./resolver";
import {DidSolIdentifier, DidSolService} from "@identity.com/sol-did-client";

const resolveSolDid = (did: string): Promise<DIDDocument> => {
    return DidSolService.build(
        DidSolIdentifier.parse(did),
    ).resolve()
}

/**
 * Borrowed from https://github.com/digitalbazaar/did-io/blob/main/lib/did-io.js
 */
const VERIFICATION_RELATIONSHIPS = new Set([
    'assertionMethod',
    'authentication',
    'capabilityDelegation',
    'capabilityInvocation',
    'keyAgreement'
]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function bazaarFindVerificationMethod({doc, methodId, purpose} = {}) {
    if(!doc) {
        throw new TypeError('A DID Document is required.');
    }
    if(!(methodId || purpose)) {
        throw new TypeError('A method id or purpose is required.');
    }

    if(methodId) {
        return _methodById({doc, methodId});
    }

    // Id not given, find the first method by purpose
    const [method] = doc[purpose] || [];
    if(method && typeof method === 'string') {
        // This is a reference, not the full method, attempt to find it
        return _methodById({doc, methodId: method});
    }

    return method;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function _methodById({doc, methodId}) {
    let result;

    // First, check the 'verificationMethod' bucket, see if it's listed there
    if(doc.verificationMethod) {
        result = doc.verificationMethod.find((method: { id: string }) => method.id === methodId);
    }

    for(const purpose of VERIFICATION_RELATIONSHIPS) {
        const methods = doc[purpose] || [];
        // Iterate through each verification method in 'authentication', etc.
        for(const method of methods) {
            // Only return it if the method is defined, not referenced
            if(typeof method === 'object' && method.id === methodId) {
                result = method;
                break;
            }
        }
        if(result) {
            return result;
        }
    }
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

        return bazaarFindVerificationMethod({
            doc: document,
            methodId: verificationMethod,
            purpose: null
        });
    }
}
