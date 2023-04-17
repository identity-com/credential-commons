export const ISSUER_DID = 'did:key:GGBX4K2roNY1E8VPes6xCuP5iqJNfFbUtH2oByxaHH9g';
export const SUBJECT_DID = 'did:sol:devnet:3WoafjUyivN7nRKzHPZyDDCKMxvd98X8YJt7L7CPE5iZ';

export const EMAIL_CREDENTIAL_IDENTIFIER = 'credential-cvc:Email-v3';

export const EMAIL_IDENTIFIER = 'claim-cvc:Contact.email-v1';
export const EMAIL_DATA = {
    domain: {
        tld: 'com',
        name: 'identity',
    },
    username: 'testing',
};

export const DOB_IDENTIFIER = 'claim-cvc:Identity.dateOfBirth-v1';
export const DOB_DATA = {
    day: 20,
    month: 11,
    year: 1978,
};
