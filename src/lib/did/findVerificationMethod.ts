/**
 * This code has been borrowed from https://github.com/digitalbazaar/did-io/blob/main/lib/did-io.js
 *
 * TODO: This code will be removed as part of IDCOM-2323
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
export function findVerificationMethod({doc, methodId, purpose} = {}) {
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
export function _methodById({doc, methodId}) {
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
