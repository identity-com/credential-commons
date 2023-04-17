// TODO: Remove this disable as part of IDCOM-2356
/* eslint-disable */
import {VerifiableCredential} from "../vc/VerifiableCredential";
import cre from "@transmute/credentials-context";
import sec from "@transmute/security-context";
import didContext from "@transmute/did-context";
import {Ed25519VerificationKey2018} from "@transmute/ed25519-key-pair";
import {
    JsonWebKey,
    JsonWebSignature,
    JsonWebKey2020,
} from "@transmute/json-web-signature";
import {verifiable} from "@transmute/vc.js";
import {IDiDResolver} from "../lib/resolver";
import Proof from "./Proof";
import {VerificationMethod} from "did-resolver";

// The credential context that includes additional properties
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
            },
        },
    },
};

const updateCredentialContext = (context: any) => {
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
    [didContext.constants.DID_CONTEXT_V1_URL]: didContext.contexts.get(
        didContext.constants.DID_CONTEXT_V1_URL
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
    "https://www.identity.com/credentials/v3": credentialContext
};

type ProofFormat = "vc" | "vc-jwt";

export default class JsonWebSignatureProof implements Proof<JsonWebKey2020> {
    constructor(private resolver: IDiDResolver, private format: ProofFormat = "vc") {
    }

    async sign(credential: VerifiableCredential, key: JsonWebKey2020): Promise<VerifiableCredential> {
        // Add the JWS context
        credential["@context"].push(sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL);

        const result = await verifiable.credential.create({
            credential: credential.toJSON(),
            format: [this.format],
            documentLoader: this.documentLoader.bind(this),
            suite: new JsonWebSignature({
                key: await JsonWebKey.from(key),
                date: credential.issuanceDate,
            }),
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return result.items[0];
    }

    async verify(credential: VerifiableCredential): Promise<boolean> {
        const result = await verifiable.credential.verify({
            credential: credential,
            format: [this.format],
            documentLoader: this.documentLoader.bind(this),
            suite: new JsonWebSignature({
                date: credential.issuanceDate,
            }),
        });

        return result.verified;
    }

    private async documentLoader(iri: string) {
        if (contexts[iri]) {
            return {document: contexts[iri]};
        }

        if (/^did:/.test(iri)) {
            return this.createController(iri);
        }

        throw new Error(`Unsupported iri: ${iri}`);
    }

    private async createController(iri: string) {
        const did = iri.split("#")[0];

        const doc = await this.resolver.resolve(did);

        if(!doc) {
            throw new Error(`No document found for  ${did}`)
        }

        const foundKey = doc.verificationMethod?.find((pk: VerificationMethod) => pk.id.startsWith(iri));

        if(!foundKey) {
            throw new Error(`No Verification Method found for ${iri}`);
        }

        const key = await JsonWebKey.from(foundKey as Ed25519VerificationKey2018);

        const vm = await key.export({type: 'JsonWebKey2020'});

        const controller = {
            '@context': [
                didContext.constants.DID_CONTEXT_V1_URL,
                sec.constants.JSON_WEB_SIGNATURE_2020_V1_URL,
            ],
            id: vm.controller,
            verificationMethod: [vm],
            assertionMethod: [vm.id],
            authentication: [vm.id],
            capabilityInvocation: [vm.id],
            capabilityDelegation: [vm.id],
            keyAgreement: [vm.id],
        };

        return {
            document: controller,
        };
    }
}

