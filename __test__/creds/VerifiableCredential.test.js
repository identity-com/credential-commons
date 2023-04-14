const _ = require('lodash');
const fs = require('fs');
const uuidv4 = require('uuid/v4');
const sjcl = require('sjcl');
const {Claim} = require('claim/Claim');
const VC = require('creds/VerifiableCredential');
const MiniCryptoManagerImpl = require('services/MiniCryptoManagerImpl');
const didTestUtil = require('../lib/util/did');
const solResolver = require('lib/did');

const {VerifiableCredential} = require('vc/VerifiableCredential')
const CvcMerkleProof = require('proof/CvcMerkleProof').default;

const {
    schemaLoader,
    CVCSchemaLoader,
} = require('index');
const filteredCredentialJson = require('./fixtures/filteredIdDocument-v3.json');
const invalidEmailJson = require('./fixtures/CredentialEmailInvalid.json');
const {Ed25519SignerVerifier} = require("proof/CvcMerkleProof/Ed25519SignerVerifier");
const {Keypair} = require("@solana/web3.js");

const credentialSubject = 'did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V';

const issuerKeypair = Keypair.generate();

const credentialIssuer = `did:sol:${issuerKeypair.publicKey.toBase58()}`;
const credentialIssuerVm = `${credentialIssuer}#default`;

const cvcMerkleProof = new CvcMerkleProof(new Ed25519SignerVerifier(solResolver, credentialIssuerVm, issuerKeypair));

jest.setTimeout(150000);

const XPVT1 = 'xprvA1yULd2DFYnQRVbLiAKrFdftVLsANiC3rqLvp8iiCbnchcWqd6kJPoaV3sy7R6CjHM8RbpoNdWVgiPZLVa1EmneRLtwiitNpWgwyVmjvay7'; // eslint-disable-line
const XPUB1 = 'xpub6Expk8Z75vLhdyfopBrrcmcd3NhenAuuE4GXcX8KkwKbaQqzAe4Ywbtxu9F95hRHj79PvdtYEJcoR6gesbZ79fS4bLi1PQtm81rjxAHeLL9'; // eslint-disable-line

const identityName = {givenNames: 'Max', otherNames: 'Abc', familyNames: 'Mustermann'};
const identityDateOfBirth = {day: 20, month: 3, year: 1978};

const miniCryptoManager = new MiniCryptoManagerImpl();
const signAttestationSubject = (subject, xprv, xpub) => {
    const {label} = subject;
    const {data} = subject;
    const tupleToHash = JSON.stringify({xpub, label, data});
    const hashToSignHex = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(tupleToHash));
    const keyName = `TEMP_KEY_${new Date().getTime()}`;
    miniCryptoManager.installKey(keyName, xprv);
    const signature = miniCryptoManager.sign(keyName, hashToSignHex);

    return {
        pub: xpub,
        label,
        data,
        signature,
    };
};


const toValueObject = obj => JSON.parse(JSON.stringify(obj));

class TestSchemaLoader extends CVCSchemaLoader {
    // eslint-disable-next-line class-methods-use-this
    valid(identifier) {
        return /^(claim|credential|type)-(test):.*$/.test(identifier);
    }

    async loadSchema(identifier) {
        try {
            // eslint-disable-next-line global-require,import/no-dynamic-require
            return require(`../schema/fixtures/${identifier}.schema.json`);
            // eslint-disable-next-line no-empty
        } catch (e) {
        }

        return super.loadSchema(identifier);
    }
}

describe('Unit tests for Verifiable Credentials', () => {
    beforeAll(() => {
        schemaLoader.addLoader(new CVCSchemaLoader());

        // didTestUtil.mockDids();
    });

    beforeEach(() => {
        schemaLoader.reset();
    });

    test('Dont construct undefined Credentials', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        return expect(VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'cvc:cred:Test',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: new Date(new Date().getTime() + 100000),
        }))
            .rejects.toThrow(/cvc:cred:Test is not defined/);
    });

    test('New Defined Credentials', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const cred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: new Date(new Date().getTime() + 100000),
        })

        expect(cred).toBeDefined();
        expect(cred.credentialSubject.identity.name.givenNames).toBe('Max');
        expect(cred.credentialSubject.identity.name.otherNames).toBe('Abc');
        expect(cred.credentialSubject.identity.name.familyNames).toBe('Mustermann');
        expect(cred.credentialSubject.identity.dateOfBirth.day).toBe(20);
        expect(cred.credentialSubject.identity.dateOfBirth.month).toBe(3);
        expect(cred.credentialSubject.identity.dateOfBirth.year).toBe(1978);
    });

    test('should validate new defined credentials with the obligatory Meta:expirationDate UCA with'
        + ' null value', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const cred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        })

        expect(cred).toBeDefined();
        expect(cred.expirationDate).toBeNull();
    });

    test('New Expirable Credentials', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        })

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred).toBeDefined();
        expect(cred.credentialSubject.identity.name.givenNames).toBe('Max');
        expect(cred.credentialSubject.identity.name.otherNames).toBe('Abc');
        expect(cred.credentialSubject.identity.name.familyNames).toBe('Mustermann');
        expect(cred.credentialSubject.identity.dateOfBirth.day).toBe(20);
        expect(cred.credentialSubject.identity.dateOfBirth.month).toBe(3);
        expect(cred.credentialSubject.identity.dateOfBirth.year).toBe(1978);
        expect(_.find(cred.proof.leaves, {identifier: 'cvc:Meta:issuer'})).toBeDefined();
        expect(_.find(cred.proof.leaves, {identifier: 'cvc:Meta:issuanceDate'})).toBeDefined();
        expect(cred.expirationDate).toBeDefined();
        expect(_.find(cred.proof.leaves, {identifier: 'cvc:Meta:expirationDate'})).toBeDefined();
        expect(cred.proof.leaves).toHaveLength(8);
    });

    it('should request an anchor for Credential and return an temporary attestation', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        return CvcMerkleProof.requestAnchor(cred).then((updated) => {
            console.log(updated);
            expect(updated.proof.anchor.type).toBe('temporary');
            expect(updated.proof.anchor.value).not.toBeDefined();
            expect(updated.proof.anchor).toBeDefined();
            expect(updated.proof.anchor.schema).toBe('dummy-20180201');
            done();
        });
    });

    it.skip('should refresh an temporary anchoring with an permanent one', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);

        cred.requestAnchor = jest.fn().mockImplementation(async () => {
            // mock the function or otherwise it would call the server
            const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
            const mockedVc = await CvcMerkleProof.vcFromJSON(JSON.parse(credentialContents));
            mockedVc.updateAnchor = jest.fn().mockImplementation(async () => mockedVc);
            return mockedVc;
        });
        return cred.requestAnchor().then((updated) => {
            expect(updated.proof.anchor).toBeDefined();
            return updated.updateAnchor().then((newUpdated) => {
                expect(newUpdated.proof.anchor.type).toBe('permanent');
                expect(newUpdated.proof.anchor).toBeDefined();
                expect(newUpdated.proof.anchor.subject).toBeDefined();
                done();
            });
        });
    });

    test('Filter claims from Identity Name', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);

        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const simpleIdentity = await cvcMerkleProof.sign(unsignedCred);

        const filtered = CvcMerkleProof.filter(simpleIdentity, ['claim-cvc:Name.givenNames-v1']);
        expect(filtered.credentialSubject.identity.name.givenNames).toBeDefined();
        expect(filtered.credentialSubject.identity.name.otherNames).not.toBeDefined();
        expect(filtered.credentialSubject.identity.name.familyNames).not.toBeDefined();

        const emptyFiltered = CvcMerkleProof.filter(simpleIdentity, []);
        expect(emptyFiltered.credentialSubject).toEqual({});
    });

    it('Should filter claims for Email asking for claim-cvc:Contact.email-v1 and return them on the filtered VC',
        async () => {
            const email = {
                domain: {
                    tld: 'oVaPsceZ4C',
                    name: 'UTpHKFyaaB',
                },
                username: 'ZcMpCBQ0lE',
            };

            const emailUca = await Claim.create('claim-cvc:Contact.email-v1', email, '1');

            const unsignedCred = await VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:Email-v3',
                subject: credentialSubject,
                claims: [emailUca],
                expiry: null,
            });

            const emailCredential = await cvcMerkleProof.sign(unsignedCred);

            const filtered = CvcMerkleProof.filter(emailCredential, ['claim-cvc:Contact.email-v1']);
            expect(filtered.credentialSubject.contact.email.domain).toBeDefined();
            expect(filtered.credentialSubject.contact.email.domain.tld).toBe('oVaPsceZ4C');
            expect(filtered.credentialSubject.contact.email.domain.name).toBe('UTpHKFyaaB');
            expect(filtered.credentialSubject.contact.email.username).toBe('ZcMpCBQ0lE');
        });

    it('Should filter claims for Email asking for cvc:Contact:domain and not return the cvc:Contact:address',
        async () => {
            const email = {
                domain: {
                    tld: 'oVaPsceZ4C',
                    name: 'UTpHKFyaaB',
                },
                username: 'ZcMpCBQ0lE',
            };

            const emailUca = await Claim.create('claim-cvc:Contact.email-v1', email, '1');
            const unsignedCred = await VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:Email-v3',
                subject: credentialSubject,
                claims: [emailUca],
                expiry: null,
            });

            const emailCredential = await cvcMerkleProof.sign(unsignedCred);

            const filtered = CvcMerkleProof.filter(emailCredential, ['claim-cvc:Email.domain-v1']);

            expect(filtered.credentialSubject.contact.email.domain).toBeDefined();
            expect(filtered.credentialSubject.contact.email.domain.tld).toBe('oVaPsceZ4C');
            expect(filtered.credentialSubject.contact.email.domain.name).toBe('UTpHKFyaaB');
            expect(filtered.credentialSubject.contact.email.username).toBeUndefined();
        });

    it('Should filter claims for Address asking for claim-cvc:Type.address-v1'
        + 'and return the claim-cvc:Type.address-v1', async () => {
        const value = {
            country: 'X2sEB9F9W9',
            county: 'sDlIM4Rjpo',
            state: 'ZZEOrbenrM',
            street: 'JkHgN5gdZ2',
            unit: 'fo9OmPSZNe',
            city: 'LVkRGsKqIf',
            postalCode: '5JhmWkXBAg',
        };

        const uca = await Claim.create('claim-cvc:Identity.address-v1', value, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Address-v3',
            subject: credentialSubject,
            claims: [uca],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Identity.address-v1']);

        expect(filtered.credentialSubject.identity.address).toBeDefined();
        expect(filtered.credentialSubject.identity.address.country).toBe('X2sEB9F9W9');
        expect(filtered.credentialSubject.identity.address.county).toBe('sDlIM4Rjpo');
        expect(filtered.credentialSubject.identity.address.state).toBe('ZZEOrbenrM');
        expect(filtered.credentialSubject.identity.address.street).toBe('JkHgN5gdZ2');
        expect(filtered.credentialSubject.identity.address.unit).toBe('fo9OmPSZNe');
        expect(filtered.credentialSubject.identity.address.city).toBe('LVkRGsKqIf');
        expect(filtered.credentialSubject.identity.address.postalCode).toBe('5JhmWkXBAg');
    });

    it('Should filter claims for PhoneNumber asking for credential-cvc:PhoneNumber-v3 and return the full claim',
        async () => {
            const value = {
                country: '1ApYikRwDl',
                countryCode: 'U4drpB96Hk',
                number: 'kCTGifTdom',
                extension: 'sXZpZJTe4R',
                lineType: 'OaguqgUaR7',
            };

            const uca = await Claim.create('claim-cvc:Contact.phoneNumber-v1', value, '1');

            const unsignedCred = await VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:PhoneNumber-v3',
                subject: credentialSubject,
                claims: [uca],
                expiry: null,
            });

            const credential = await cvcMerkleProof.sign(unsignedCred);

            const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Contact.phoneNumber-v1']);

            expect(filtered.credentialSubject.contact.phoneNumber).toBeDefined();
            expect(filtered.credentialSubject.contact.phoneNumber.country).toBe('1ApYikRwDl');
            expect(filtered.credentialSubject.contact.phoneNumber.countryCode).toBe('U4drpB96Hk');
            expect(filtered.credentialSubject.contact.phoneNumber.extension).toBe('sXZpZJTe4R');
            expect(filtered.credentialSubject.contact.phoneNumber.lineType).toBe('OaguqgUaR7');
            expect(filtered.credentialSubject.contact.phoneNumber.number).toBe('kCTGifTdom');
        });

    it('Should filter claims for GenericDocumentId asking for claim-cvc:Identity.dateOfBirth-v1 and return nothing',
        async () => {
            const typeValue = 'passport';
            const type = await Claim.create('claim-cvc:Document.type-v1', typeValue, '1');
            const numberValue = '3bj1LUg9yG';
            const number = await Claim.create('claim-cvc:Document.number-v1', numberValue, '1');
            const nameValue = {
                givenNames: 'e8qhs4Iak1',
                familyNames: '4h8sLtEfav',
                otherNames: 'bDTn4stMpX',
            };
            const name = await Claim.create('claim-cvc:Document.name-v1', nameValue, '1');
            const genderValue = 'jFtCBFceQI';
            const gender = await Claim.create('claim-cvc:Document.gender-v1', genderValue, '1');
            const issueLocationValue = 'OZbhzBU8ng';
            const issueLocation = await Claim.create('claim-cvc:Document.issueLocation-v1', issueLocationValue, '1');
            const issueAuthorityValue = 'BO2xblNSVK';
            const issueAuthority = await Claim.create('claim-cvc:Document.issueAuthority-v1', issueAuthorityValue, '1');
            const issueCountryValue = 'p4dNUeAKtI';
            const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', issueCountryValue, '1');
            const placeOfBirthValue = 'r4hIHbyLru';
            const placeOfBirth = await Claim.create('claim-cvc:Document.placeOfBirth-v1', placeOfBirthValue, '1');
            const dateOfBirthValue = {
                day: 23,
                month: 2,
                year: 1973,
            };
            const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
            const addressValue = {
                country: 'IH4aiXuEoo',
                county: 'akKjaQehNK',
                state: 'IQB7oLhSnS',
                street: '52Os5zJgkh',
                unit: '3dGDkhEHxW',
                city: 'WU9GJ0R9be',
                postalCode: 'ci1DMuz16W',
            };
            const address = await Claim.create('claim-cvc:Document.address-v1', addressValue, '1');
            const propertiesValue = {
                dateOfIssue: {
                    day: 18,
                    month: 6,
                    year: 1928,
                },
                dateOfExpiry: {
                    day: 8,
                    month: 1,
                    year: 1957,
                },
            };
            const properties = await Claim.create('claim-cvc:Document.properties-v1', propertiesValue, '1');
            const imageValue = {
                front: '9NMgeFErNd',
                frontMD5: 'zgOvmWXruS',
                back: 'uPrJKO3cbq',
                backMD5: '0yr9zkdApo',
            };
            const image = await Claim.create('cvc:Document:image', imageValue, '1');

            const unsignedCred = await VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:GenericDocumentId-v3',
                subject: credentialSubject,
                claims: [type, number, name, gender, issueAuthority,
                    issueLocation, issueCountry, placeOfBirth, properties, address, image, dateOfBirth],
                expiry: null,
            });

            const credential = await cvcMerkleProof.sign(unsignedCred);


            const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Identity.dateOfBirth-v1']);

            expect(filtered.credentialSubject.document).toBeUndefined();
        });

    it('Should filter claims for PhoneNumber asking for cvc:Phone:countryCode and return only the'
        + ' claim for country code', async () => {
        const value = {
            country: '1ApYikRwDl',
            countryCode: 'U4drpB96Hk',
            number: 'kCTGifTdom',
            extension: 'sXZpZJTe4R',
            lineType: 'OaguqgUaR7',
        };
        const uca = await Claim.create('claim-cvc:Contact.phoneNumber-v1', value, '1');
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:PhoneNumber-v3',
            subject: credentialSubject,
            claims: [uca],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:PhoneNumber.countryCode-v1']);

        expect(filtered.credentialSubject.contact.phoneNumber).toBeDefined();
        expect(filtered.credentialSubject.contact.phoneNumber.country).toBeUndefined();
        expect(filtered.credentialSubject.contact.phoneNumber.countryCode).toBe('U4drpB96Hk');
        expect(filtered.credentialSubject.contact.phoneNumber.extension).toBeUndefined();
        expect(filtered.credentialSubject.contact.phoneNumber.lineType).toBeUndefined();
        expect(filtered.credentialSubject.contact.phoneNumber.number).toBeUndefined();
    });

    it('Should create IdDocument-v3 credential', async () => {
        const type = await Claim.create('claim-cvc:Document.type-v1', 'passport', '1');
        const number = await Claim.create('claim-cvc:Document.number-v1', 'FP12345', '1');
        const nameValue = {
            givenNames: 'e8qhs4Iak1',
            familyNames: 'e8qak1',
            otherNames: 'qhs4I',
        };
        const name = await Claim.create('claim-cvc:Document.name-v1', nameValue, '1');
        const gender = await Claim.create('claim-cvc:Document.gender-v1', 'M', '1');
        const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', 'Brazil', '1');
        const placeOfBirth = await Claim.create('claim-cvc:Document.placeOfBirth-v1', 'Belo Horizonte', '1');
        const dateOfBirthValue = identityDateOfBirth;
        const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
        const dateOfExpiryValue = {
            day: 12,
            month: 2,
            year: 2025,
        };
        const dateOfExpiry = await Claim.create('claim-cvc:Document.dateOfExpiry-v1', dateOfExpiryValue, '1');
        const nationality = await Claim.create('claim-cvc:Document.nationality-v1', 'Brazilian', '1');

        const evidencesValue = {
            idDocumentFront: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            idDocumentBack: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            selfie: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
        };
        const evidences = await Claim.create('claim-cvc:Document.evidences-v1', evidencesValue, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:IdDocument-v3',
            subject: credentialSubject,
            claims: [type, number, name, gender, issueCountry, placeOfBirth, dateOfBirth, dateOfExpiry, nationality],
            evidences,
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
        const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Document.dateOfBirth-v1']);
        expect(filtered).toBeDefined();
    });

    it('Should hydrate a partial presentation', async () => {
        const presentation = await CvcMerkleProof.vcFromJSON(filteredCredentialJson, true);
        expect(presentation).toBeDefined();

        return expect(CvcMerkleProof.vcFromJSON(filteredCredentialJson)).rejects.toThrow();
    });

    it('Should create alt:Identity-v1 credential', async () => {
        const nameValue = {
            givenNames: 'e8qhs4Iak1',
            familyNames: 'e8qak1',
            otherNames: 'qhs4I',
        };
        const name = await Claim.create('claim-cvc:Document.name-v1', nameValue, '1');
        const dateOfBirthValue = identityDateOfBirth;
        const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
        const addressValue = {
            country: 'IH4aiXuEoo',
            county: 'akKjaQehNK',
            state: 'IQB7oLhSnS',
            street: '52Os5zJgkh',
            unit: '3dGDkhEHxW',
            city: 'WU9GJ0R9be',
            postalCode: 'ci1DMuz16W',
        };
        const address = await Claim.create('claim-cvc:Document.address-v1', addressValue, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-alt:Identity-v3',
            subject: credentialSubject,
            claims: [name, dateOfBirth, address],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
    });

    it('Should create and verify a credential with an array of clains ', async () => {
        const covidDetails = {
            patient: {
                fullName: 'Patient Name',
                dateOfBirth: {
                    day: 2,
                    month: 2,
                    year: 1945,
                },
            },
            vaccinations: [
                {
                    vaccinationId: 'vID-123',
                    dateOfAdministration: '150000001',
                    name: 'Pfizer',
                    manufacturer: {
                        name: 'Pfizer',
                        code: {
                            name: 'codeName',
                            code: 'codeCode',
                            codeSystem: 'codeCodeSystem',
                            codeSystemName: 'codeCodeSystemName',
                        },
                    },
                    detail: {
                        createdAt: {
                            day: 2,
                            month: 2,
                            year: 1945,
                        },
                        updatedAt: {
                            day: 2,
                            month: 2,
                            year: 1945,
                        },
                    },
                    organization: {
                        name: 'CVS',
                    },
                    codes: [
                        {
                            name: 'codeName1',
                            code: 'codeCode1',
                            codeSystem: 'codeCodeSystem1',
                            codeSystemName: 'codeCodeSystemName1',
                        },
                        {
                            name: 'codeName2',
                            code: 'codeCode2',
                            codeSystem: 'codeCodeSystem3',
                            codeSystemName: 'codeCodeSystemName3',
                        },
                    ],
                },
                {
                    vaccinationId: 'vID-124',
                    dateOfAdministration: '150000002',
                    name: 'Pfizer',
                    organization: {
                        name: 'CVS',
                    },
                },
            ],
            tests: [
                {
                    testId: 'tID-23',
                    testDate: '150000008',
                    resultDate: '150000010',
                    type: 'testType',
                    result: 'negative',
                    codes: [
                        {
                            name: 'codeName21',
                            code: 'codeCode21',
                            codeSystem: 'codeCodeSystem21',
                            codeSystemName: 'codeCodeSystemName21',
                        },
                        {
                            name: 'codeName22',
                            code: 'codeCode22',
                            codeSystem: 'codeCodeSystem23',
                            codeSystemName: 'codeCodeSystemName23',
                        },
                    ],
                },
                {
                    testId: 'tID-25',
                    testDate: '150000028',
                    resultDate: '150000020',
                    type: 'testType',
                    result: 'negative',
                },
            ],
        };
        const covidClaim = await Claim.create('claim-cvc:Medical.covid19-v1', covidDetails);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Covid19-v3',
            subject: credentialSubject,
            claims: [covidClaim],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(credential)).toBeTruthy();
    });

    it('Should filter claims for GenericDocumentId asking for cvc:Document:Type and return only that claim',
        async () => {
            const typeValue = 'passport';
            const type = await Claim.create('claim-cvc:Document.type-v1', typeValue, '1');
            const numberValue = '3bj1LUg9yG';
            const number = await Claim.create('claim-cvc:Document.number-v1', numberValue, '1');
            const nameValue = {
                givenNames: 'e8qhs4Iak1',
                familyNames: '4h8sLtEfav',
                otherNames: 'bDTn4stMpX',
            };
            const name = await Claim.create('claim-cvc:Document.name-v1', nameValue, '1');
            const genderValue = 'jFtCBFceQI';
            const gender = await Claim.create('claim-cvc:Document.gender-v1', genderValue, '1');
            const issueLocationValue = 'OZbhzBU8ng';
            const issueLocation = await Claim.create('claim-cvc:Document.issueLocation-v1', issueLocationValue, '1');
            const issueAuthorityValue = 'BO2xblNSVK';
            const issueAuthority = await Claim.create('claim-cvc:Document.issueAuthority-v1', issueAuthorityValue, '1');
            const issueCountryValue = 'p4dNUeAKtI';
            const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', issueCountryValue, '1');
            const placeOfBirthValue = 'r4hIHbyLru';
            const placeOfBirth = await Claim.create('claim-cvc:Document.placeOfBirth-v1', placeOfBirthValue, '1');
            const dateOfBirthValue = {
                day: 23,
                month: 2,
                year: 1973,
            };
            const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
            const addressValue = {
                country: 'IH4aiXuEoo',
                county: 'akKjaQehNK',
                state: 'IQB7oLhSnS',
                street: '52Os5zJgkh',
                unit: '3dGDkhEHxW',
                city: 'WU9GJ0R9be',
                postalCode: 'ci1DMuz16W',
            };
            const address = await Claim.create('claim-cvc:Document.address-v1', addressValue, '1');
            const propertiesValue = {
                dateOfIssue: {
                    day: 18,
                    month: 6,
                    year: 1928,
                },
                dateOfExpiry: {
                    day: 8,
                    month: 1,
                    year: 1957,
                },
            };
            const properties = await Claim.create('claim-cvc:Document.properties-v1', propertiesValue, '1');
            const imageValue = {
                front: '9NMgeFErNd',
                frontMD5: 'zgOvmWXruS',
                back: 'uPrJKO3cbq',
                backMD5: '0yr9zkdApo',
            };
            const image = await Claim.create('cvc:Document:image', imageValue, '1');

            const unsignedCred = await VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:GenericDocumentId-v3',
                subject: credentialSubject,
                claims: [type, number, name, gender, issueAuthority,
                    issueLocation, issueCountry, placeOfBirth, properties, address, image, dateOfBirth],
                expiry: null,
            });

            const credential = await cvcMerkleProof.sign(unsignedCred);

            const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Document.type-v1']);

            expect(filtered.credentialSubject.document.type).toBe('passport');
        });

    it('Should verify an VC of type Email', async () => {
        const credJSon = require('./fixtures/Email.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    it('Should not verify an VC of with tampered domain Email', async () => {
        const credJSon = require('./fixtures/Email.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        cred.credentialSubject.contact.email.domain.name = 'civic';
        expect(await cvcMerkleProof.verifyProofs(cred)).toBeFalsy();
    });

    it('Should not verify an VC of with tampered username Email', async () => {
        const credJSon = require('./fixtures/Email.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        cred.credentialSubject.contact.email.username = 'jpMustermann';
        expect(await cvcMerkleProof.verifyProofs(cred)).toBeFalsy();
    });

    it('Should verify an VC of type Address', async () => {
        const credJSon = require('./fixtures/Address.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    it('Should not verify an VC of tampered Address', async () => {
        const credJSon = require('./fixtures/Address.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        cred.credentialSubject.identity.address.city = 'Rio de Janeiro';
        expect(await cvcMerkleProof.verifyProofs(cred)).toBeFalsy();
    });

    it('Should verify an VC of type Identity', async () => {
        const credJSon = require('./fixtures/Identity.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    it('Should verify an VC of type GenericDocumentId and doing await CvcMerkleProof.vcFromJSON', async () => {
        const credJSon = require('./fixtures/GenericDocumentId.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    it('Should not verify an VC of tampered GenericDocumentId', async () => {
        const credJSon = require('./fixtures/GenericDocumentId.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        cred.credentialSubject.document.dateOfBirth.day = 20;
        cred.credentialSubject.document.dateOfBirth.year = 1900;

        expect(await cvcMerkleProof.verifyProofs(cred)).toBeFalsy();
    });

    it('Should verify an VC of type PhoneNumber', async () => {
        const credJSon = require('./fixtures/PhoneNumber.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });


    // This breaks VC.verify - verify has been deprecated
    test.skip('cvcMerkleProof.verifyLevel(): with a valid cred without expirationDate, should return at least'
        + ' VERIFY_LEVELS.PROOFS level', async () => {
        const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verifyLevel(cred)).toBeGreaterThanOrEqual(CvcMerkleProof.VERIFY_LEVELS.PROOFS);
    });

    it('Should verify an credential json with no cryptographic security', async () => {
        const credential = require('./fixtures/PhoneNumber.json'); // eslint-disable-line
        const isValid = await cvcMerkleProof.verifyProofs(credential);
        expect(isValid).toBeTruthy();
    });

    it('Should verify a not anchored VC with non cryptographic verify', async () => {
        const value = {
            country: '1ApYikRwDl',
            countryCode: 'U4drpB96Hk',
            number: 'kCTGifTdom',
            extension: 'sXZpZJTe4R',
            lineType: 'OaguqgUaR7',
        };

        const uca = await Claim.create('claim-cvc:Contact.phoneNumber-v1', value, '1');
        const credential = await VC.create('credential-cvc:PhoneNumber-v3', '', null, credentialSubject, [uca]);
        const isValid = await cvcMerkleProof.verifyProofs(credential);
        expect(isValid).toBeTruthy();
    });

    it('Should fail verification of a VC with invalid cryptographic security',
        async () => expect(cvcMerkleProof.cryptographicallySecureVerify(invalidEmailJson)).resolves.toBeFalsy());

    it('Should verify an VC with cryptographic security', async (done) => {
        const credJSon = require('./fixtures/PhoneNumber.json'); // eslint-disable-line
        const credential = await CvcMerkleProof.vcFromJSON(credJSon);

        let isValid = await cvcMerkleProof.cryptographicallySecureVerify(credential);
        expect(isValid).toBeTruthy();

        const verifyAttestationFunc = () => true;
        isValid = await cvcMerkleProof.cryptographicallySecureVerify(credential, verifyAttestationFunc);
        expect(isValid).toBeTruthy();

        const verifySignatureFunc = () => true;
        isValid = await cvcMerkleProof.cryptographicallySecureVerify(credential, verifyAttestationFunc, verifySignatureFunc);
        expect(isValid).toBeTruthy();

        done();
    });

    it('Should return false if attestation or signature check fail on cryptographic verification', async (done) => {
        const credJSon = require('./fixtures/PhoneNumber.json'); // eslint-disable-line
        const credential = await CvcMerkleProof.vcFromJSON(credJSon);

        let verifyAttestationFunc = () => false;
        let isValid = await cvcMerkleProof.verifyProofs(credential, verifyAttestationFunc);
        expect(isValid).toBeFalsy();

        verifyAttestationFunc = () => true;
        const verifySignatureFunc = () => false;
        isValid = await cvcMerkleProof.cryptographicallySecureVerify(credential, verifyAttestationFunc, verifySignatureFunc);
        expect(isValid).toBeFalsy();

        done();
    });

    test('cred.verify(): VERIFY_LEVELS.PROOFS without expirationDate INVALID', async () => {
        const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
        // messing up with the targetHash:
        credJSon.proof.leaves[0].targetHash = credJSon.proof.leaves[0].targetHash.replace('a', 'b');
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verifyLevel(cred)).toEqual(CvcMerkleProof.VERIFY_LEVELS.INVALID);
    });

    it('should fail verification since it doesn\'t have an Meta:expirationDate UCA', async () => {
        const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
        // messing up with the targetHash:
        credJSon.proof.leaves[0].targetHash = credJSon.proof.leaves[0].targetHash.replace('a', 'b');
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verifyProofs(cred)).toBeFalsy();
    });

    test('cvcMerkleProof.verifyProofs(cred): with a valid cred with expirationDate, should return TRUE', async () => {
        const credJSon = require('./fixtures/CredWithFutureExpiry.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    test('cvcMerkleProof.verifyProofs(cred): with a valid cred but expired, should return FALSE', async () => {
        const credJSon = require('./fixtures/CredExpired.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verifyProofs(cred)).not.toBeTruthy();
    });

    it('should fail verification since the leaf value is tampered', async () => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCWithTamperedLeafValue.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(await cvcMerkleProof.verifyProofs(cred)).not.toBeTruthy();
    });

    it('should check that signature matches for the root of the Merkle Tree', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        expect(await CvcMerkleProof.verifyAnchorSignature(cred, )).toBeTruthy();
        done();
    });

    it('should check that signature matches for the root of the Merkle Tree using a pinned key', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        expect(await CvcMerkleProof.verifyAnchorSignature(cred, XPUB1)).toBeTruthy();
        done();
    });

    it('should fail to check that signature using a bad pinned key', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        expect(() => CvcMerkleProof.verifyAnchorSignature(cred, XPUB1.replace('9', '6'))).toThrow();
        done();
    });

    it('should tamper the root of Merkle and the signature should not match', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        // tamper merkle root
        cred.proof.merkleRoot = 'gfdagfagfda';
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        expect(await CvcMerkleProof.verifyAnchorSignature(cred)).toBeFalsy();
        done();
    });

    it('should have a empty "granted" field just after construct a VC', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred).toBeDefined();
        expect(cred.proof.granted).toBeNull();

        done();
    });

    it('should have a empty "granted" field just after construct a VC from a JSON', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.granted).toBeNull();

        done();
    });

    it('should throw exception id ".grantUsageFor()" request without proper ".requestAnchor()" first', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);
        expect(cred).toBeDefined();
        expect(cred.proof.granted).toBeNull();

        const requestorId = 'REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        try {
            CvcMerkleProof.grantUsageFor(cred, requestorId, requestId, {pvtKey: XPVT1});
        } catch (err) {
            expect(err.message).toEqual('Invalid credential attestation/anchor');
            done();
        }
    });

    it('should have a filled "granted" field after ".grantUsageFor()" request', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        await CvcMerkleProof.requestAnchor(cred);
        expect(cred).toBeDefined();
        expect(cred.proof.granted).toBeNull();
        cred.proof.anchor.subject = signAttestationSubject(cred.proof.anchor.subject, XPVT1, XPUB1);
        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(cred, requestorId, requestId, {pvtKey: XPVT1});
        expect(cred.proof.granted).not.toBeNull();
        done();
    });

    it('should have a filled "granted" field after ".grantUsageFor()" request (fromJSON test)', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.granted).toBeNull();
        cred.proof.anchor.subject = signAttestationSubject(cred.proof.anchor.subject, XPVT1, XPUB1);
        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(cred, requestorId, requestId, {pvtKey: XPVT1});
        expect(cred.proof.granted).not.toBeNull();
        done();
    });

    it('should verifyGrant() accordingly', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);
        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();

        // <wire transferred>
        const receivedCred = await CvcMerkleProof.vcFromJSON(JSON.parse(transmittedCred));
        expect(receivedCred.proof.granted).not.toBeNull();

        const verifyGrant = await CvcMerkleProof.verifyGrant(receivedCred, requestorId, requestId);
        expect(verifyGrant).toEqual(true);

        done();
    });

    it('should fail verifyGrant() with a invalid "granted" token', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();

        // <wire transferred>
        const receivedCred = await CvcMerkleProof.vcFromJSON(JSON.parse(transmittedCred));
        expect(receivedCred.proof.granted).not.toBeNull();

        // Simulate a invalid granted token - one not based on the same nonce
        // eslint-disable-next-line
        receivedCred.proof.granted = '304502210085f6baceefcddefff535416df0eda6c9b8a01dcba592c599ec2c83cce7171dd802204473f5a15b3904dbf0fc309fe812fbf449948714938fb4871196d338ef38f1d1';

        const verifyGrant = await CvcMerkleProof.verifyGrant(receivedCred, requestorId, requestId);
        expect(verifyGrant).toEqual(false);

        done();
    });

    it('should verify a granted credential json with requesterGrantVerify', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);
        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();
        expect(signedCred.proof.granted).not.toBeNull();

        const credentialObj = JSON.parse(transmittedCred);

        const verifyGrant = await CvcMerkleProof.verifyGrant(credentialObj, requestorId, requestId);
        expect(verifyGrant).toEqual(true);

        done();
    });

    it('should fail to verify a credential json with invalid granted token with requesterGrantVerify', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();
        expect(signedCred.proof.granted).not.toBeNull();

        const credentialObj = JSON.parse(transmittedCred);

        // Simulate a invalid granted token - one not based on the same nonce
        // eslint-disable-next-line max-len
        credentialObj.proof.granted = '304502210085f6baceefcddefff535416df0eda6c9b8a01dcba592c599ec2c83cce7171dd802204473f5a15b3904dbf0fc309fe812fbf449948714938fb4871196d338ef38f1d1';

        const verifyGrant = await CvcMerkleProof.verifyGrant(credentialObj, requestorId, requestId);
        expect(verifyGrant).toEqual(false);

        done();
    });

    it('should verify() with maximum level of GRANTED', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();

        // <wire transferred>
        const receivedCred = await CvcMerkleProof.vcFromJSON(JSON.parse(transmittedCred));
        expect(receivedCred.proof.granted).not.toBeNull();

        const verifyLevel = await cvcMerkleProof.verifyLevel(receivedCred, CvcMerkleProof.VERIFY_LEVELS.GRANTED, {
            requestorId,
            requestId,
        });
        expect(verifyLevel).toBeGreaterThanOrEqual(CvcMerkleProof.VERIFY_LEVELS.GRANTED);

        done();
    });

    it('should fail verify() with maximum level of GRANTED if granted is invalid', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        // const cred = await VC.create('credential-cvc:Identity-v3', uuidv4(), null, credentialSubject, [name, dob]);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        const anchoredCred = await CvcMerkleProof.requestAnchor(cred);
        expect(anchoredCred).toBeDefined();
        expect(anchoredCred.proof.granted).toBeNull();

        const subject = signAttestationSubject(anchoredCred.proof.anchor.subject, XPVT1, XPUB1);
        const signedCred = await CvcMerkleProof.vcFromJSON(toValueObject(_.merge({}, anchoredCred.toJSON(), {proof: {anchor: {subject}}})));

        const requestorId = 'ANY_REQUESTOR_ID_12345';
        const requestId = new Date().getTime(); // simulate an nonce ID
        CvcMerkleProof.grantUsageFor(signedCred, requestorId, requestId, {pvtKey: XPVT1});

        // simulate a wire transmission
        const transmittedCred = JSON.stringify(signedCred, null, 2);
        expect(transmittedCred).toBeDefined();

        // <wire transferred>
        const receivedCred = await CvcMerkleProof.vcFromJSON(JSON.parse(transmittedCred));
        expect(receivedCred.proof.granted).not.toBeNull();

        // Simulate a invalid granted token - one not based on the same nonce
        // eslint-disable-next-line
        receivedCred.proof.granted = '304502210085f6baceefcddefff535416df0eda6c9b8a01dcba592c599ec2c83cce7171dd802204473f5a15b3904dbf0fc309fe812fbf449948714938fb4871196d338ef38f1d1';

        const verifyLevel = await cvcMerkleProof.verifyLevel(receivedCred, CvcMerkleProof.VERIFY_LEVELS.GRANTED, {
            requestorId,
            requestId,
        });
        expect(verifyLevel).toBeGreaterThanOrEqual(CvcMerkleProof.VERIFY_LEVELS.ANCHOR); // Should be at least one level lower

        done();
    });

    it('should check that the anchor exists on the chain', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        const validation = await CvcMerkleProof.verifyAttestation(cred);
        expect(validation).toBeTruthy();
        done();
    });

    // TODO skiing this test to release a hotfix
    // We need to mock the "online" verification in this unit test to get it working
    it.skip('should fail the check that the anchor exists on the chain', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCTempAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);

        cred.proof.anchor.network = 'mainnet';

        const validation = await cred.verifyAttestation();
        expect(validation).toBeFalsy();
        done();
    });

    it('should fail the check with temporary attestations faked as permanent', async () => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/CredentialAttestationFaked.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);

        cred.proof.anchor.network = 'mainnet';

        const shouldFail = CvcMerkleProof.verifyAttestation(cred);
        await expect(shouldFail).rejects.toThrow(/Error: Invalid URI/);
    });

    it('should revoke the permanent anchor and succeed verification', async (done) => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        await CvcMerkleProof.requestAnchor(cred);
        await CvcMerkleProof.updateAnchor(cred);
        const validation = await CvcMerkleProof.verifyAttestation(cred);
        if (validation) {
            const isRevoked = await CvcMerkleProof.revokeAttestation(cred);
            expect(isRevoked).toBeTruthy();
        }
        done();
    });

    it('should check an unrevoked attestation and validate that is not revoked', async (done) => {
        const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
        const credentialJson = JSON.parse(credentialContents);
        const cred = await CvcMerkleProof.vcFromJSON(credentialJson);
        expect(cred).toBeDefined();
        expect(cred.proof.anchor).toBeDefined();
        const isRevoked = await CvcMerkleProof.isRevoked(cred);
        expect(isRevoked).toBeFalsy();
        done();
    });

    it('Should match with one constraint', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.name.givenNames', is: {$eq: 'Max'}},
            ],
        })).toBeTruthy();
    });

    it('Should match with two constraints', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.name.givenNames', is: {$eq: 'Max'}},
                {path: 'identity.name.otherNames', is: {$eq: 'Abc'}},
            ],
        })).toBeTruthy();
    });

    it('Should fail with two constraints if one of them fails', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.name.givenNames', is: {$eq: 'NOT MAX'}},
                {path: 'identity.name.otherNames', is: {$eq: 'Abc'}},
            ],
        })).toBeFalsy();
    });

    it('Should match with gt constraint', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.dateOfBirth.year', is: {$gt: 1900}},
            ],
        })).toBeTruthy();
    });

    it('Should match constraints targeting the parent properties of dates', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.dateOfBirth', is: {$lt: 1554377905342}}, // 4-4-2019
            ],
        })).toBeTruthy();
    });

    const getExactYearsAgo = (yearDelta) => {
        const exactYearsAgo = new Date();
        exactYearsAgo.setFullYear(new Date().getFullYear() - yearDelta);
        return exactYearsAgo;
    };

    const dateToDOBClaim = async (date) => {
        const dobClaim = {day: date.getDate(), month: date.getMonth() + 1, year: date.getFullYear()};
        return Claim.create('claim-cvc:Identity.dateOfBirth-v1', dobClaim);
    };

    it('Should match constraints targeting the parent properties and string deltas', async () => {
        const exactlyFortyYearsAgo = getExactYearsAgo(40);
        const dob = await dateToDOBClaim(exactlyFortyYearsAgo);
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.dateOfBirth', is: {$lte: '-40y'}},
            ],
        })).toBeTruthy();
    });

    it('Should not match', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);
        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.isMatch({
            claims: [
                {path: 'identity.name.first', is: {$eq: 'Maxime'}},
            ],
        })).toBeFalsy();
    });

    it('Should match credential on constraints.meta', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'credential-cvc:Email-v3',
            issuer: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'credential-cvc:Email-v3',
            ],
        };

        const constraints = {
            meta: {
                credential: 'credential-cvc:Email-v3',
            },
        };

        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
    });

    it('Should match credential on constraints.meta with issuer', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'credential-cvc:Email-v3',
            issuer: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'credential-cvc:Email-v3',
            ],
        };

        const constraints = {
            meta: {
                credential: 'credential-cvc:Email-v3',
                issuer: {
                    is: {
                        $eq: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
                    },
                },
            },
        };

        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
    });

    it('Should not match credential on constraints.meta with wrong issuer', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'credential-cvc:Email-v3',
            issuer: 'did:ethr:0x00000',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'credential-cvc:Email-v3',
            ],
        };

        const constraints = {
            meta: {
                credential: 'credential-cvc:Email-v3',
                issuer: {
                    is: {
                        $eq: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
                    },
                },
            },
        };

        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraints)).toBeFalsy();
    });

    it('Should match credential on constraints.meta with multiple fields', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'credential-cvc:Email-v3',
            issuer: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'credential-cvc:Email-v3',
            ],
        };

        const constraints = {
            meta: {
                credential: 'credential-cvc:Email-v3',
                issuer: {
                    is: {
                        $eq: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
                    },
                },
                id: {
                    is: {
                        $eq: '123456789',
                    },
                },
            },
        };

        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
    });

    it('Should not match credential on constraints.meta with invalid field', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'civ:Credential:CivicBasic',
            issuer: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'civ:Credential:CivicBasic',
            ],
        };

        const constraints = {
            meta: {
                credential: 'credential-civ:Credential:CivicBasic-1',
                issuer: {
                    is: {
                        $eq: 'did:ethr:NOT_MATCH',
                    },
                },
                id: {
                    is: {
                        $eq: '123456789',
                    },
                },
            },
        };

        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraints)).toBeFalsy();
    });

    it('Should not match credential if constraints.meta are invalid or empty', () => {
        const vcMeta = {
            id: '123456789',
            identifier: 'civ:Credential:CivicBasic',
            issuer: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
            issuanceDate: '2018-09-27T01:14:41.287Z',
            expirationDate: '2028-09-26T11:22:21.287Z',
            version: '1',
            type: [
                'Credential',
                'civ:Credential:CivicBasic',
            ],
        };

        const constraint = {};
        expect(VerifiableCredential.isMatchCredentialMeta(vcMeta, constraint)).toBeFalsy();
    });

    it('Should return all Credential properties for credential-cvc:GenericDocumentId-v3', async () => {
        const properties = await VerifiableCredential.getAllProperties('credential-cvc:GenericDocumentId-v3');
        expect(properties).toHaveLength(30);
        expect(properties).toContain('document.type');
        expect(properties).toContain('document.number');
        expect(properties).toContain('document.gender');
        expect(properties).toContain('document.issueLocation');
        expect(properties).toContain('document.issueAuthority');
        expect(properties).toContain('document.issueCountry');
        expect(properties).toContain('document.placeOfBirth');
        expect(properties).toContain('document.name.givenNames');
        expect(properties).toContain('document.name.familyNames');
        expect(properties).toContain('document.name.otherNames');
        expect(properties).toContain('document.dateOfBirth.day');
        expect(properties).toContain('document.dateOfBirth.month');
        expect(properties).toContain('document.dateOfBirth.year');
        expect(properties).toContain('document.address.country');
        expect(properties).toContain('document.address.county');
        expect(properties).toContain('document.address.state');
        expect(properties).toContain('document.address.street');
        expect(properties).toContain('document.address.unit');
        expect(properties).toContain('document.address.city');
        expect(properties).toContain('document.address.postalCode');
        expect(properties).toContain('document.properties.dateOfIssue.day');
        expect(properties).toContain('document.properties.dateOfIssue.month');
        expect(properties).toContain('document.properties.dateOfIssue.year');
        expect(properties).toContain('document.properties.dateOfExpiry.day');
        expect(properties).toContain('document.properties.dateOfExpiry.month');
        expect(properties).toContain('document.properties.dateOfExpiry.year');
        expect(properties).toContain('document.image.front');
        expect(properties).toContain('document.image.frontMD5');
        expect(properties).toContain('document.image.back');
        expect(properties).toContain('document.image.backMD5');
    });

    it('Should return all Credential properties for credential-cvc:Identity-v3', async () => {
        const properties = await VerifiableCredential.getAllProperties('credential-cvc:Identity-v3');
        expect(properties).toHaveLength(6);
        expect(properties).toContain('identity.name.givenNames');
        expect(properties).toContain('identity.name.familyNames');
        expect(properties).toContain('identity.name.otherNames');
        expect(properties).toContain('identity.dateOfBirth.day');
        expect(properties).toContain('identity.dateOfBirth.month');
        expect(properties).toContain('identity.dateOfBirth.year');
    });

    it('Should return all Credential properties for credential-cvc:Address-v3', async () => {
        const properties = await VerifiableCredential.getAllProperties('credential-cvc:Address-v3');
        expect(properties).toHaveLength(7);
        expect(properties).toContain('identity.address.country');
        expect(properties).toContain('identity.address.county');
        expect(properties).toContain('identity.address.state');
        expect(properties).toContain('identity.address.street');
        expect(properties).toContain('identity.address.unit');
        expect(properties).toContain('identity.address.city');
        expect(properties).toContain('identity.address.postalCode');
    });

    it('Should return all Credential properties for credential-cvc:PhoneNumber-v3', async () => {
        const properties = await VerifiableCredential.getAllProperties('credential-cvc:PhoneNumber-v3');
        expect(properties).toHaveLength(5);
        expect(properties).toContain('contact.phoneNumber.country');
        expect(properties).toContain('contact.phoneNumber.countryCode');
        expect(properties).toContain('contact.phoneNumber.number');
        expect(properties).toContain('contact.phoneNumber.extension');
        expect(properties).toContain('contact.phoneNumber.lineType');
    });

    it('Should return all Credential properties for credential-cvc:Email-v3', async () => {
        const properties = await VerifiableCredential.getAllProperties('credential-cvc:Email-v3');
        expect(properties).toHaveLength(3);
        expect(properties).toContain('contact.email.username');
        expect(properties).toContain('contact.email.domain.name');
        expect(properties).toContain('contact.email.domain.tld');
    });

    it('Should construct a VC with no evidence provided', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1',
            {givenNames: 'Neymar', otherNames: 'Jr', familyNames: 'Mustermann'});
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {day: 5, month: 2, year: 1992});

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred).toBeDefined();
    });

    it('Should construct a VC with the provided evidence', async () => {
        const evidence = {
            id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
            type: ['DocumentVerification'],
            verifier: 'did:ethr:xxx',
            evidenceDocument: 'Brazilian Passport',
            subjectPresence: 'Digital',
            documentPresence: 'Digital',
        };
        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.evidence).toBeDefined();
        expect(cred.evidence).toEqual([evidence]);
    });

    it('Should construct a VC with multiple evidence items', async () => {
        const evidence = [
            {
                id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
                type: ['DocumentVerification'],
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
            {
                id: 'https://idv.civic.com/evidence/a1adcc52-ac1d-31ff-1cd3-0123591dcadal',
                type: ['DocumentVerification'],
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
        ];
        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.evidence).toBeDefined();
        expect(cred.evidence).toEqual(evidence);
    });

    it('Should include only the evidence properties in the credential', async () => {
        const evidence = [
            {
                id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
                type: ['DocumentVerification'],
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
                other: 'other',
            },
        ];
        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.evidence).toBeDefined();
        expect(cred.evidence.other).not.toBeDefined();
    });

    it('Should construct a credential with an evidence without id', async () => {
        const evidence = [
            {
                type: ['DocumentVerification'],
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
        ];
        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred.evidence).toBeDefined();
        expect(cred.evidence).toEqual(evidence);
    });

    it('Should throw exception if a evidence required property is missing', async () => {
        const evidence = [
            {
                id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
        ];

        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        return expect(VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        })).rejects.toThrow(/Evidence type is required/);
    });

    it('Should throw exception if evidence id is NOT a valid url', async () => {
        const evidence = [
            {
                id: 'not an URL',
                type: ['DocumentVerification'],
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
        ];

        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        return expect(VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        })).rejects.toThrow(/Evidence id is not a valid URL/);
    });

    it('Should throw exception if evidence type is not an array', async () => {
        const evidence = [
            {
                id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
                type: 'DocumentVerification',
                verifier: 'did:ethr:xxx',
                evidenceDocument: 'Brazilian Passport',
                subjectPresence: 'Digital',
                documentPresence: 'Digital',
            },
        ];

        const name = await Claim.create('claim-cvc:Identity.name-v1', {
            givenNames: 'Neymar',
            otherNames: 'Jr',
            familyNames: 'Mustermann',
        });
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', {
            day: 5,
            month: 2,
            year: 1992,
        });

        return expect(VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            evidence,
            expiry: null,
        })).rejects.toThrow(/Evidence type is not an Array object/);
    });

    it('Should create credential if all claims are provided', async () => {
        const verificationMethod = `${didTestUtil.DID_CONTROLLER}#default`;
        const keypair = didTestUtil.keyPair(didTestUtil.DID_CONTROLLER);

        const type = await Claim.create('claim-cvc:Document.type-v1', 'passport', '1');
        const number = await Claim.create('claim-cvc:Document.number-v1', '123', '1');
        const name = await Claim.create('claim-cvc:Document.name-v1', {givenNames: 'Maxime'}, '1');
        const gender = await Claim.create('claim-cvc:Document.gender-v1', 'M', '1');
        const nationality = await Claim.create('claim-cvc:Document.nationality-v1', 'Brazilian', '1');
        const placeOfBirth = await Claim.create('claim-cvc:Document.placeOfBirth-v1', 'Brazil', '1');
        const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', 'Brazil', '1');
        const dateOfExpiryValue = {
            day: 20,
            month: 3,
            year: 2020,
        };
        const dateOfExpiry = await Claim.create('claim-cvc:Document.dateOfExpiry-v1', dateOfExpiryValue, '1');
        const dateOfBirthValue = identityDateOfBirth;
        const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
        const evidences = await Claim.create('claim-cvc:Document.evidences-v1', {
            idDocumentFront: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            idDocumentBack: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            selfie: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
        }, '1');

        // const credential = await VC.create('credential-cvc:IdDocument-v3',
        //     didTestUtil.DID_CONTROLLER,
        //     null,
        //     credentialSubject,
        //     ucas,
        //     null,
        //     {
        //         verificationMethod,
        //         keypair,
        //     });

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:IdDocument-v3',
            subject: credentialSubject,
            claims: [type, number, name, gender, issueCountry, placeOfBirth, dateOfBirth, nationality, dateOfExpiry, evidences,],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred).toBeDefined();
        expect(await cvcMerkleProof.verify(cred)).toBe(true);
    });

    it('Should throw exception on credential creation if required uca is missing', async () => {
        const type = await Claim.create('claim-cvc:Document.type-v1', 'passport', '1');
        const name = await Claim.create('claim-cvc:Document.name-v1', {givenNames: 'Maxime'}, '1');
        const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', 'Brazil', '1');

        return expect(VerifiableCredential.create({
                issuer: credentialIssuer,
                identifier: 'credential-cvc:IdDocument-v3',
                subject: credentialSubject,
                claims: [type, name, issueCountry],
                expiry: null,
            })
        ).rejects
            .toThrow(/Missing required fields to credential-cvc:IdDocument-v3/);
    });


    it('Should verify a VC without non-required claims', async () => {
        const credJSon = require('./fixtures/IdDocumentWithoutNonRequiredClaims.json'); // eslint-disable-line
        const cred = await CvcMerkleProof.vcFromJSON(credJSon);
        expect(cred).toBeDefined();
        expect(cvcMerkleProof.verifyProofs(cred)).toBeTruthy();
    });

    it('Should throw exception when creating a VC from json without required claims', async () => {
        const credJSon = require('./fixtures/IdDocumentWithoutRequiredClaims.json'); // eslint-disable-line

        return expect(CvcMerkleProof.vcFromJSON(credJSon))
            .rejects.toThrow();
    });
});

describe('Transient Credential Tests', () => {
    beforeAll(() => {
        schemaLoader.addLoader(new CVCSchemaLoader());
    });

    beforeEach(() => {
        schemaLoader.reset();
    });

    it('Should create an US Address Transient Credential', async () => {
        const value = {
            country: 'US',
            county: 'Melo Park',
            state: 'California',
            street: 'Oak',
            unit: '12',
            city: 'Palo Alto',
            postalCode: '94555',
        };

        const uca = await Claim.create('claim-cvc:Identity.address-v1', value, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:UnverifiedAddress-v3',
            subject: credentialSubject,
            claims: [uca],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
        expect(credential.transient).toBeTruthy();

        credential.requestAnchor();

        expect(credential.proof.anchor).toBeDefined();
        expect(credential.proof.anchor.type).toBe('transient');

        const verified = await credential.verifyAttestation();
        expect(verified).toBeTruthy();

        const proved = credential.verifyProofs();
        expect(proved).toBeTruthy();
    });

    it('Should create an US SSN Transient Credential', async () => {
        const value = {
            areaNumber: '111',
            groupNumber: '11',
            serialNumber: '1111',
        };

        const uca = await Claim.create('claim-cvc:SocialSecurity.number-v1', value, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: credentialIssuer,
            identifier: 'credential-cvc:UnverifiedSsn-v3',
            subject: credentialSubject,
            claims: [uca],
            expiry: null,
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
        expect(credential.transient).toBeTruthy();

        credential.requestAnchor();

        expect(credential.proof.anchor).toBeDefined();
        expect(credential.proof.anchor.type).toBe('transient');

        const verified = await credential.verifyAttestation();
        expect(verified).toBeTruthy();

        const proved = credential.verifyProofs();
        expect(proved).toBeTruthy();
    });
});

describe('Signed Verifiable Credentials', () => {
    beforeAll(() => {
        schemaLoader.addLoader(new CVCSchemaLoader());

        // didTestUtil.mockDids();
    });

    beforeEach(() => {
        schemaLoader.reset();
    });

    test('Should create a verifiable credential instance', async () => {
        const verificationMethod = `${didTestUtil.DID_SPARSE}#default`;
        const keypair = didTestUtil.keyPair(didTestUtil.DID_SPARSE);

        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        // const cred = await VC.create(
        //     'credential-cvc:Identity-v3',
        //     didTestUtil.DID_SPARSE,
        //     null,
        //     credentialSubject,
        //     [name, dob],
        //     null,
        //     {
        //         verificationMethod,
        //         keypair,
        //     },
        // );

        const unsignedCred = await VerifiableCredential.create({
            issuer: didTestUtil.DID_SPARSE,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        expect(cred).toBeDefined();
        expect(cred.proof.merkleRootSignature.signature).toBeDefined();
        expect(cred.proof.merkleRootSignature.verificationMethod).toBe(verificationMethod);

        expect(await cred.verifyMerkletreeSignature()).toBe(true);
    });


    test('Should fail to verify a signature if the issuer didn\'t sign', async () => {
        const verificationMethod = `${didTestUtil.DID_SPARSE}#default`;
        const keypair = didTestUtil.keyPair(didTestUtil.DID_SPARSE);

        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const cred = await VC.create(
            'credential-cvc:Identity-v3',
            didTestUtil.DID_SPARSE,
            null,
            credentialSubject,
            [name, dob],
            null,
            {
                verificationMethod,
                keypair,
            },
        );

        expect(cred).toBeDefined();
        expect(cred.proof.merkleRootSignature.signature).toBeDefined();
        expect(cred.proof.merkleRootSignature.verificationMethod).toBe(verificationMethod);

        // change the issuer DID on the VC
        cred.issuer = didTestUtil.DID_CONTROLLER;

        expect(await cred.verifyMerkletreeSignature()).toBe(false);
    });

    test('Should not be able to sign with a removed key', async () => {
        const verificationMethod = `${didTestUtil.DID_WITH_NO_DEFAULT}#default`;
        const keypair = didTestUtil.keyPair(didTestUtil.DID_WITH_NO_DEFAULT);

        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const credCreate = VC.create(
            'credential-cvc:Identity-v3',
            didTestUtil.DID_WITH_NO_DEFAULT,
            null,
            credentialSubject,
            [name, dob],
            null,
            {
                verificationMethod,
                keypair,
            },
        );

        return expect(credCreate).rejects.toThrow(
            `The verificationMethod ${verificationMethod} is not allowed to sign for ${didTestUtil.DID_WITH_NO_DEFAULT}`,
        );
    });

    test('Should be able to sign as a controller of the issuer did', async () => {
        const verificationMethod = `${didTestUtil.DID_CONTROLLER}#default`;
        const keypair = didTestUtil.keyPair(didTestUtil.DID_CONTROLLER);

        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const cred = await VC.create(
            'credential-cvc:Identity-v3',
            didTestUtil.DID_CONTROLLED,
            null,
            credentialSubject,
            [name, dob],
            null,
            {
                verificationMethod,
                keypair,
            },
        );

        expect(cred).toBeDefined();
        expect(cred.proof.merkleRootSignature.signature).toBeDefined();
        expect(cred.proof.merkleRootSignature.verificationMethod).toBe(verificationMethod);

        expect(await cred.verifyMerkletreeSignature()).toBe(true);
    });

    test('Should verify credential(data only) signature', async () => {
        const verificationMethod = `${didTestUtil.DID_SPARSE}#default`;

        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const cred = await VC.create(
            'credential-cvc:Identity-v3',
            didTestUtil.DID_SPARSE,
            null,
            credentialSubject,
            [name, dob],
            null,
            {
                verificationMethod,
                keypair: didTestUtil.keyPair(didTestUtil.DID_SPARSE),
            },
        );

        expect(cred).toBeDefined();
        expect(cred.proof.merkleRootSignature).toBeDefined();

        const verifier = await signerVerifier.verifier(didTestUtil.DID_SPARSE, verificationMethod, solResolver);
        const dataOnlyCredential = JSON.parse(JSON.stringify(cred));
        expect(verifier.verify(dataOnlyCredential)).toBeTruthy();
    });
});

describe('Referenced Schemas for Verifiable Credentials', () => {
    beforeAll(() => {
        schemaLoader.addLoader(new TestSchemaLoader());
        schemaLoader.addLoader(new CVCSchemaLoader());
    });

    test('Loads a schema the contains a reference', async () => {
        const type = await Claim.create('claim-cvc:Document.type-v1', 'passport', '1');
        const number = await Claim.create('claim-cvc:Document.number-v1', 'FP12345', '1');
        const nameValue = {
            givenNames: 'e8qhs4Iak1',
            familyNames: 'e8qak1',
            otherNames: 'qhs4I',
        };
        const name = await Claim.create('claim-cvc:Document.name-v1', nameValue, '1');
        const gender = await Claim.create('claim-cvc:Document.gender-v1', 'M', '1');
        const issueCountry = await Claim.create('claim-cvc:Document.issueCountry-v1', 'Brazil', '1');
        const placeOfBirth = await Claim.create('claim-cvc:Document.placeOfBirth-v1', 'Belo Horizonte', '1');
        const dateOfBirthValue = identityDateOfBirth;
        const dateOfBirth = await Claim.create('claim-cvc:Document.dateOfBirth-v1', dateOfBirthValue, '1');
        const dateOfExpiryValue = {
            day: 12,
            month: 2,
            year: 2025,
        };
        const dateOfExpiry = await Claim.create('claim-cvc:Document.dateOfExpiry-v1', dateOfExpiryValue, '1');
        const nationality = await Claim.create('claim-cvc:Document.nationality-v1', 'Brazilian', '1');

        const evidencesValue = {
            idDocumentFront: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            idDocumentBack: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
            selfie: {
                algorithm: 'sha256',
                data: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            },
        };
        const evidences = await Claim.create('claim-cvc:Document.evidences-v1', evidencesValue, '1');

        const unsignedCred = await VerifiableCredential.create({
            issuer: didTestUtil.DID_SPARSE,
            identifier: 'credential-test:IdDocument-v1',
            subject: credentialSubject,
            claims: [type, number, name, gender, issueCountry, placeOfBirth, dateOfBirth, dateOfExpiry, nationality, evidences],
            expiry: null,
            evidences: evidencesValue
        });

        const credential = await cvcMerkleProof.sign(unsignedCred);

        expect(credential).toBeDefined();
        const filtered = CvcMerkleProof.filter(credential, ['claim-cvc:Document.dateOfBirth-v1']);
        expect(filtered).toBeDefined();
    });

    test('Validates a schema the contains a reference', async () => {
        const type = await Claim.create('claim-cvc:Document.type-v1', 'passport', '1');
        const number = await Claim.create('claim-cvc:Document.number-v1', 'FP12345', '1');

        return expect(VerifiableCredential.create({
            issuer: didTestUtil.DID_SPARSE,
            identifier: 'credential-test:IdDocument-v1',
            subject: credentialSubject,
            claims: [type, number],
            expiry: null,
        })).rejects.toThrow('Missing required fields to credential-test:IdDocument-v1');
    });
});

describe('Verifiable Credential JSON serialization', () => {
    beforeAll(() => {
        schemaLoader.addLoader(new CVCSchemaLoader());
    });

    it('serializes a VC to JSON', async () => {
        const name = await Claim.create('claim-cvc:Identity.name-v1', identityName);
        const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', identityDateOfBirth);

        const unsignedCred = await VerifiableCredential.create({
            issuer: didTestUtil.DID_SPARSE,
            identifier: 'credential-cvc:Identity-v3',
            subject: credentialSubject,
            claims: [name, dob],
            expiry: null,
        });

        const cred = await cvcMerkleProof.sign(unsignedCred);

        // serialize the credential to JSON, then back to an object to be tested against
        const credJSON = JSON.parse(JSON.stringify(cred));

        expect(credJSON).toEqual(expect.objectContaining({
            '@context': ['https://www.w3.org/2018/credentials/v1', 'https://www.identity.com/credentials/v3'],
            id: cred.id,
            issuer: cred.issuer,
            issuanceDate: cred.issuanceDate,
            type: ['VerifiableCredential', 'IdentityCredential'],
            credentialSubject: {
                id: credentialSubject,
                identity: {
                    name: {
                        familyNames: identityName.familyNames,
                        givenNames: identityName.givenNames,
                        otherNames: identityName.otherNames,
                    },
                    dateOfBirth: {
                        day: identityDateOfBirth.day,
                        month: identityDateOfBirth.month,
                        year: identityDateOfBirth.year,
                    },
                },
            },
        }));
    });
});
