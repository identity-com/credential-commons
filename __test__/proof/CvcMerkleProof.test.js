const {VerifiableCredential} = require('vc/VerifiableCredential');
const {Claim} = require('index');
const {
    schemaLoader,
    CVCSchemaLoader,
} = require('index');

const solResolver = require('lib/did');

const CvcMerkleProof = require('proof/CvcMerkleProof').default;
const {Ed25519SignerVerifier} = require("proof/CvcMerkleProof/Ed25519SignerVerifier");
const {Keypair} = require("@solana/web3.js");
const issuerKeypair = Keypair.generate();

const credentialIssuer = `did:sol:${issuerKeypair.publicKey.toBase58()}`;
const credentialIssuerVm = `${credentialIssuer}#default`;

const proof = new CvcMerkleProof(new Ed25519SignerVerifier(solResolver, credentialIssuerVm, issuerKeypair));

import {ISSUER_DID, SUBJECT_DID, EMAIL_CREDENTIAL_IDENTIFIER, EMAIL_IDENTIFIER, EMAIL_DATA, DOB_IDENTIFIER, DOB_DATA} from './constants';

describe('Verifiable Credentials', () => {
    let emailClaim;
    let dobClaim;

    beforeAll(async () => {
        schemaLoader.addLoader(new CVCSchemaLoader());

        emailClaim = await Claim.create(EMAIL_IDENTIFIER, EMAIL_DATA);
        dobClaim = await Claim.create(DOB_IDENTIFIER, DOB_DATA);
    });

    it('Should create a CVC MerkleProof Signature credential', async () => {
        const unsignedVc = await VerifiableCredential.create({
            identifier: EMAIL_CREDENTIAL_IDENTIFIER,
            issuer: credentialIssuer,
            subject: SUBJECT_DID,
            claims: [emailClaim],
            expiry: new Date(new Date().getTime() + 100000),
        });

        const signedVc = await proof.sign(unsignedVc);

        const verified = await proof.verify(signedVc);

        expect(verified).toBe(true);
    })

    it('Should fail to verify tampered a credential signed with CVCMerkleProof', async () => {
        const unsignedVc = await VerifiableCredential.create({
            identifier: EMAIL_CREDENTIAL_IDENTIFIER,
            issuer: credentialIssuer,
            subject: SUBJECT_DID,
            claims: [emailClaim],
            expiry: new Date(new Date().getTime() + 100000),
        });

        const signedVc = await proof.sign(unsignedVc);

        signedVc.credentialSubject.contact.email.username = 'tamper';

        const verified = await proof.verify(signedVc);

        expect(verified).toBe(false);
    })
})
