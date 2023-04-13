import {VerifiableCredential} from "../vc/VerifiableCredential";
import cre from "@transmute/credentials-context";
import sec from "@transmute/security-context";
import did from "@transmute/did-context";
import {verifiable} from "@transmute/vc.js";
import {IDiDResolver} from "../lib/resolver";
import Proof from "./Proof";
import {EcdsaSecp256k1RecoveryMethod2020, EcdsaSecp256k1RecoverySignature2020} from "@transmute/lds-ecdsa-secp256k1-recovery2020"
import {JsonWebKey2020} from "@transmute/json-web-signature";

const credentialContext = {
    '@context': {
        '@version': 1.1,
        '@protected': true,
        id: '@id',
        type: '@type',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        IdentityCredential: {
            '@id': 'https://www.identity.com/credentials/v1#identityCredential',
            '@context': {
                '@version': 1.1,
                '@protected': true,
                identifier: {
                    '@id': 'cvc:identifier',
                    '@type': 'xsd:string',
                },
                version: {
                    '@id': 'cvc:version',
                    '@type': 'xsd:decimal',
                },
                // credentialSubject: {
                //     "@id": "cvc:credentialSubject",
                //     "@context": {
                //         contact: {
                //             '@id': 'cvc:contact',
                //             '@type': '@json',
                //         },
                //     }
                // }
            },
        },
    },
};

const updateCredentialContext = (context: any) => {
    // TODO: Feels hacky?
    context["@context"].VerifiableCredential["@context"].credentialSubject = {
        '@id': 'cred:credentialSubject',
        '@type': '@json'
    };

    return context;
}

export const contexts: any = {
    [cre.constants.CREDENTIALS_CONTEXT_V1_URL]: updateCredentialContext(cre.contexts.get(
        cre.constants.CREDENTIALS_CONTEXT_V1_URL
    )),
    [did.constants.DID_CONTEXT_V1_URL]: did.contexts.get(
        did.constants.DID_CONTEXT_V1_URL
    ),
    [sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL]: sec.contexts.get(
        sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL
    ),
    [sec.constants.BLS12381_2020_V1_URL]: sec.contexts.get(
        sec.constants.BLS12381_2020_V1_URL
    ),
    "https://w3id.org/security/bbs/v1": sec.contexts.get(
        sec.constants.BLS12381_2020_V1_URL
    ),
    "https://w3id.org/security/v2": sec.contexts.get(
        sec.constants.SECURITY_CONTEXT_V2_URL
    ),
    "https://w3id.org/security/v1": sec.contexts.get(
        sec.constants.SECURITY_CONTEXT_V1_URL
    ),
    "https://www.identity.com/credentials/v3": credentialContext,
    "https://w3id.org/security/suites/secp256k1recovery-2020/v2": {
        "@context": {
            "id": "@id",
            "type": "@type",
            "@protected": true,
            "proof": {
                "@id": "https://w3id.org/security#proof",
                "@type": "@id",
                "@container": "@graph"
            },
            "EcdsaSecp256k1RecoveryMethod2020": {
                "@id": "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoveryMethod2020",
                "@context": {
                    "@protected": true,
                    "id": "@id",
                    "type": "@type",
                    "controller": {
                        "@id": "https://w3id.org/security#controller",
                        "@type": "@id"
                    },
                    "blockchainAccountId": "https://w3id.org/security#blockchainAccountId",
                    "publicKeyJwk": {
                        "@id": "https://w3id.org/security#publicKeyJwk",
                        "@type": "@json"
                    }
                }
            },
            "EcdsaSecp256k1RecoverySignature2020": {
                "@id": "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020#EcdsaSecp256k1RecoverySignature2020",
                "@context": {
                    "@protected": true,
                    "id": "@id",
                    "type": "@type",
                    "challenge": "https://w3id.org/security#challenge",
                    "created": {
                        "@id": "http://purl.org/dc/terms/created",
                        "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                    },
                    "domain": "https://w3id.org/security#domain",
                    "expires": {
                        "@id": "https://w3id.org/security#expiration",
                        "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                    },
                    "jws": "https://w3id.org/security#jws",
                    "nonce": "https://w3id.org/security#nonce",
                    "proofPurpose": {
                        "@id": "https://w3id.org/security#proofPurpose",
                        "@type": "@vocab",
                        "@context": {
                            "@protected": true,
                            "id": "@id",
                            "type": "@type",
                            "assertionMethod": {
                                "@id": "https://w3id.org/security#assertionMethod",
                                "@type": "@id",
                                "@container": "@set"
                            },
                            "authentication": {
                                "@id": "https://w3id.org/security#authenticationMethod",
                                "@type": "@id",
                                "@container": "@set"
                            },
                            "capabilityInvocation": {
                                "@id": "https://w3id.org/security#capabilityInvocationMethod",
                                "@type": "@id",
                                "@container": "@set"
                            },
                            "capabilityDelegation": {
                                "@id": "https://w3id.org/security#capabilityDelegationMethod",
                                "@type": "@id",
                                "@container": "@set"
                            },
                            "keyAgreement": {
                                "@id": "https://w3id.org/security#keyAgreementMethod",
                                "@type": "@id",
                                "@container": "@set"
                            }
                        }
                    },
                    "verificationMethod": {
                        "@id": "https://w3id.org/security#verificationMethod",
                        "@type": "@id"
                    }
                }
            }
        }
    }
};


// const key = {
//     id: 'did:key:zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp#zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp',
//     type: 'EcdsaSecp256k1RecoveryMethod2020',
//     controller: 'did:key:zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp',
//     publicKeyJwk: {
//         kty: 'EC',
//         crv: 'secp256k1',
//         x: 'RwiZITTa2Dcmq-V1j-5tgPUshOLO31FbsnhVS-7lskc',
//         y: '3o1-UCc3ABh757P58gDISSc4hOj9qyfSGl3SGGA7xdc'
//     },
//     privateKeyJwk: {
//         kty: 'EC',
//         crv: 'secp256k1',
//         x: 'RwiZITTa2Dcmq-V1j-5tgPUshOLO31FbsnhVS-7lskc',
//         y: '3o1-UCc3ABh757P58gDISSc4hOj9qyfSGl3SGGA7xdc',
//         d: 'T2azVap7CYD_kB8ilbnFYqwwYb5N-GcD6yjGEvquZXg'
//     }
// }

type ProofFormat = "vc" | "vc-jwt";

export default class EcdsaSecp256k1RecoverySignature2020Proof implements Proof<any> {
    constructor(private resolver: IDiDResolver, private format: ProofFormat = "vc") {
    }

    async sign(credential: VerifiableCredential, key: any): Promise<VerifiableCredential> {
        credential["@context"].push("https://w3id.org/security/suites/secp256k1recovery-2020/v2");

        const result = await verifiable.credential.create({
            credential,
            format: [this.format],
            documentLoader: this.documentLoader.bind(this),
            suite: new EcdsaSecp256k1RecoverySignature2020({
                key: await EcdsaSecp256k1RecoveryMethod2020.from(key),
                date: credential.issuanceDate,
            }),
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result.items[0];
    }

    async verify(credential: VerifiableCredential): Promise<boolean> {
        const result = await verifiable.credential.verify({
            credential,
            format: [this.format],
            documentLoader: this.documentLoader.bind(this),
            suite: new EcdsaSecp256k1RecoverySignature2020({
                date: credential.issuanceDate,
            }),
        });

        return result.verified;
    }

    private async documentLoader(iri: string) {
        console.log("IRI: " + iri);

        if (contexts[iri]) {
            return {document: contexts[iri]};
        }

        if (/^did:/.test(iri)) {
            return this.createController(iri);
        }

        throw new Error(`Unsupported iri: ${iri}`);
    }

    private async createController(iri: string) {
        try {
            console.log("CREATE CONTOLLER A");

            const did = iri.split("#")[0];
            console.log("CREATE CONTOLLER B");

            const doc = await this.resolver.resolve(did);
            console.log("CREATE CONTOLLER C");

            if (!doc) {
                throw new Error(`No document found for  ${did}`)
            }

            const foundKey = doc.verificationMethod?.find((pk: any) => pk.id.startsWith(iri));
            console.log("CREATE CONTOLLER D");
            console.log(foundKey);

            const key = await EcdsaSecp256k1RecoveryMethod2020.from(foundKey);
            console.log("CREATE CONTOLLER E");

// console.log(key);
            // const vm = await key.export({type: 'JsonWebKey2020'});
            console.log("CREATE CONTOLLER F");

            const controller = {
                // '@context': [
                //     'https://www.w3.org/ns/did/v1',
                //     'https://w3id.org/security/suites/jws-2020/v1',
                // ],
                // id: vm.controller,
                // verificationMethod: [vm],
                // assertionMethod: [vm.id],
                // authentication: [vm.id],
                // capabilityInvocation: [vm.id],
                // capabilityDelegation: [vm.id],
                // keyAgreement: [vm.id],
            };

            return {
                document: controller,
            };
        } catch(e) {
            console.log(e);
            throw e;
        }
    }
}

