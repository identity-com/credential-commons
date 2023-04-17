import {JsonWebKey} from "@transmute/json-web-signature";

const {VerifiableCredential} = require('vc/VerifiableCredential');
const {Claim} = require('index');
const {
    schemaLoader,
    CVCSchemaLoader,
} = require('index');
const DidKeyResolver = require("../lib/util/didKeyResolver");
const {Ed25519KeyPair} = require('@transmute/ed25519-key-pair');
const {Secp256k1KeyPair} = require('@transmute/secp256k1-key-pair');

const JsonWebSignatureProof = require('proof/JsonWebSignatureProof').default;

import {
    ISSUER_DID,
    SUBJECT_DID,
    EMAIL_CREDENTIAL_IDENTIFIER,
    EMAIL_IDENTIFIER,
    EMAIL_DATA,
    DOB_IDENTIFIER,
    DOB_DATA
} from './constants';

describe('Verifiable Credentials signed with JsonWebSignatureProof', () => {
    let emailClaim;
    let dobClaim;

    beforeAll(async () => {
        schemaLoader.addLoader(new CVCSchemaLoader());

        emailClaim = await Claim.create(EMAIL_IDENTIFIER, EMAIL_DATA);
        dobClaim = await Claim.create(DOB_IDENTIFIER, DOB_DATA);
    });

    it('Should create a credential signed with JsonWebSignatureProof', async () => {
        const ed25519KeyPair = await Ed25519KeyPair.generate({
            secureRandom: () => new Uint8Array(32)
        });
        const key = await ed25519KeyPair.export({
            privateKey: true,
            type: "JsonWebKey2020"
        });

        const unsignedVc = await VerifiableCredential.create({
            identifier: EMAIL_CREDENTIAL_IDENTIFIER,
            issuer: key.controller,
            subject: SUBJECT_DID,
            claims: [emailClaim],
            expiry: new Date(new Date().getTime() + 100000),
        });

        const proof = new JsonWebSignatureProof(new DidKeyResolver(Ed25519KeyPair));

        const signedVc = await proof.sign(unsignedVc, key);

        const verified = await proof.verify(signedVc);

        expect(verified).toBe(true);
    });

    it('Should fail to verify tampered a credential signed with JsonWebSignatureProof', async () => {
        const ed25519KeyPair = await Ed25519KeyPair.generate({
            secureRandom: () => new Uint8Array(32)
        });
        const key = await ed25519KeyPair.export({
            privateKey: true,
            type: "JsonWebKey2020"
        });

        const unsignedVc = await VerifiableCredential.create({
            identifier: EMAIL_CREDENTIAL_IDENTIFIER,
            issuer: key.controller,
            subject: SUBJECT_DID,
            claims: [emailClaim],
            expiry: new Date(new Date().getTime() + 100000),
        });

        const proof = new JsonWebSignatureProof(new DidKeyResolver(Ed25519KeyPair));

        const signedVc = await proof.sign(unsignedVc, key);

        signedVc.credentialSubject.contact.email.username = 'tamper';

        const verified = await proof.verify(signedVc);

        expect(verified).toBe(false);
    });
})
