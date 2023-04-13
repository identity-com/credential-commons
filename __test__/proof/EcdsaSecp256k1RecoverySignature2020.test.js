const {VerifiableCredential} = require('vc/VerifiableCredential');
const {Claim} = require('index');
const {
    schemaLoader,
    CVCSchemaLoader,
} = require('index');
const DidKeyResolver = require("../lib/util/didKeyResolver");
const {Ed25519KeyPair} = require('@transmute/ed25519-key-pair');
const {Secp256k1KeyPair} = require('@transmute/secp256k1-key-pair');

const EcdsaSecp256k1RecoverySignature2020 = require('proof/EcdsaSecp256k1RecoverySignature2020').default;
const {generateKeypairAndDid} = require('../lib/util/did');

import {
    ISSUER_DID,
    SUBJECT_DID,
    EMAIL_CREDENTIAL_IDENTIFIER,
    EMAIL_IDENTIFIER,
    EMAIL_DATA,
    DOB_IDENTIFIER,
    DOB_DATA
} from './constants';

describe('Verifiable Credentials', () => {
    let emailClaim;
    let dobClaim;
    beforeAll(async () => {
        schemaLoader.addLoader(new CVCSchemaLoader());

        emailClaim = await Claim.create(EMAIL_IDENTIFIER, EMAIL_DATA);
        dobClaim = await Claim.create(DOB_IDENTIFIER, DOB_DATA);
    });

    it('Should sign a credential using EcdsaSecp256k1RecoverySignature2020', async () => {
        const keypair = {
            id: 'did:key:zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp#zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp',
            type: 'EcdsaSecp256k1RecoveryMethod2020',
            controller: 'did:key:zQ3shjRPgHQQbTtXyofk1ygghRJ75RZpXmWBMY1BKnhyz7zKp',
            publicKeyJwk: {
                kty: 'EC',
                crv: 'secp256k1',
                x: 'RwiZITTa2Dcmq-V1j-5tgPUshOLO31FbsnhVS-7lskc',
                y: '3o1-UCc3ABh757P58gDISSc4hOj9qyfSGl3SGGA7xdc'
            },
            privateKeyJwk: {
                kty: 'EC',
                crv: 'secp256k1',
                x: 'RwiZITTa2Dcmq-V1j-5tgPUshOLO31FbsnhVS-7lskc',
                y: '3o1-UCc3ABh757P58gDISSc4hOj9qyfSGl3SGGA7xdc',
                d: 'T2azVap7CYD_kB8ilbnFYqwwYb5N-GcD6yjGEvquZXg'
            }
        }

        const unsignedVc = await VerifiableCredential.create({
            identifier: EMAIL_CREDENTIAL_IDENTIFIER,
            issuer: keypair.controller,
            subject: SUBJECT_DID,
            claims: [emailClaim],
            expiry: new Date(new Date().getTime() + 100000),
        });
        const proof = new EcdsaSecp256k1RecoverySignature2020(new DidKeyResolver(Secp256k1KeyPair));

        const signedVc = await proof.sign(unsignedVc, keypair);

        // console.log(JSON.stringify(signedVc, null, 2));

        const verxified = await proof.verify(signedVc);

        expect(verified).toBe(true);
    })
})
