const {DiDResolver} = require('lib/resolver');
const DidKeyResolver = require("./util/didKeyResolver");
const {Ed25519KeyPair} = require('@transmute/ed25519-key-pair');
const {Secp256k1KeyPair} = require('@transmute/secp256k1-key-pair');
const {Claim, VC} = require("index");
const {generateKeypairAndDid} = require('./util/did');
const {
    schemaLoader,
    CVCSchemaLoader,
} = require('index');

schemaLoader.addLoader(new CVCSchemaLoader());

describe("DiDResolver", () => {
    describe("resolve", () => {
        const mockResolveMethod = jest.fn();

        const mockDidMethods = {
            mock: mockResolveMethod
        };

        const didResolver = new DiDResolver(mockDidMethods);

        afterEach(() => {
            jest.resetAllMocks();
        });

        it("should resolve a DID", async () => {
            // Assemble
            const mockDID = "did:mock:12345";
            const mockDidDocument = {id: mockDID};
            const mockResolutionResult = {didDocument: mockDidDocument};
            mockResolveMethod.mockResolvedValueOnce(mockResolutionResult);

            // Act
            const resolvedDidDocument = await didResolver.resolve(mockDID);

            // Assert
            expect(mockResolveMethod).toHaveBeenCalledWith(mockDID, expect.anything(), expect.anything(), expect.anything());
            expect(resolvedDidDocument).toEqual(mockDidDocument);
        });

        it("should return null if the DID is not resolved", async () => {
            // Assemble
            const mockDID = "did:mock:12345";
            mockResolveMethod.mockResolvedValueOnce({
                didDocument: null
            });

            // Act
            const resolvedDidDocument = await didResolver.resolve(mockDID);

            // Assert
            expect(mockResolveMethod).toHaveBeenCalledWith(mockDID, expect.anything(), expect.anything(), expect.anything());
            expect(resolvedDidDocument).toBeNull();
        });
    });

    describe('did:key signing and resolution', () => {
        const createSigner = (document, keypair) => {
            return {
                async sign(proof) {
                    const signer = keypair.signer();
                    const signature = await signer.sign({data: proof.merkleRoot});

                    return {
                        signature: Buffer.from(signature).toString("hex"),
                        verificationMethod: document.verificationMethod[0].id,
                    };
                },

                async verify(vc) {
                    const verifier = keypair.verifier();
                    return verifier.verify({
                        data: vc.proof.merkleRoot,
                        signature: Uint8Array.from(Buffer.from(vc.proof.merkleRootSignature.signature, 'hex'))
                    })
                }
            }
        }

        const createCredential = async(document, signer, resolver) => {
            const did = document.id;

            const emailClaim = await Claim.create('claim-cvc:Contact.email-v1', {
                domain: {
                    tld: 'com',
                    name: 'identity',
                },
                username: 'testing',
            });

            return await VC.create('credential-cvc:Email-v3', did, null, did, [emailClaim], null, {
                verificationMethod: document.verificationMethod[0].id,
                signer,
            }, resolver);
        }

        it('Resolves a did:key Ed25519 document', async () => {
            const {did} = await generateKeypairAndDid(Ed25519KeyPair);

            const keyResolver = new DidKeyResolver(Ed25519KeyPair);
            const document = await keyResolver.resolve(did);

            expect(document.id).toEqual(did);
            expect(document.verificationMethod[0].type).toEqual("Ed25519VerificationKey2018");
        });

        it('Resolves a did:key Secp256k1 document', async () => {
            const {did, keypair} = await generateKeypairAndDid(Secp256k1KeyPair);

            const keyResolver = new DidKeyResolver(Secp256k1KeyPair);
            const document = await keyResolver.resolve(did);

            expect(document.id).toEqual(did);
            expect(document.verificationMethod[0].type).toEqual("EcdsaSecp256k1VerificationKey2019");
        });

        it('Signs and verifies a did:key Ed25519 credential', async () => {
            const{keypair, did} = await generateKeypairAndDid(Ed25519KeyPair);
            const keyResolver = new DidKeyResolver(Ed25519KeyPair);
            const document = await keyResolver.resolve(did);

            const signer = createSigner(document, keypair);

            const credential = await createCredential(document, signer, keyResolver);

            const verified = await credential.verifyMerkletreeSignature();

            expect(verified).toBe(true);
        })

        it('Signs and verifies a did:key Secp256k1 credential', async () => {
            const{keypair, did} = await generateKeypairAndDid(Secp256k1KeyPair);
            const keyResolver = new DidKeyResolver(Secp256k1KeyPair);
            const document = await keyResolver.resolve(did);

            const signer = createSigner(document, keypair);

            const credential = await createCredential(document, signer, keyResolver);

            const verified = await credential.verifyMerkletreeSignature();

            expect(verified).toBe(true);
        });

        it('Fails to verify a did:key Secp256k1 credential with tampered issuer', async () => {
            const {keypair, did} = await generateKeypairAndDid(Secp256k1KeyPair);

            const keyResolver = new DidKeyResolver(Secp256k1KeyPair);
            const document = await keyResolver.resolve(did);

            const signer = createSigner(document, keypair);

            const emailCredential = await createCredential(document, signer, keyResolver);

            // change the issuer to tamper with the VC
            emailCredential.issuer = "did:key:zQ3shtxV1FrJfhqE1dvxYRcCknWNjHc3c5X1y3ZSoPDi2aur2";

            const verified = await emailCredential.verifyMerkletreeSignature();

            expect(verified).toBe(false);
        });
    });
});
