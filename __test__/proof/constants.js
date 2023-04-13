export const ISSUER_KEY = [89, 226, 178, 51, 54, 183, 9, 46, 98, 202, 69, 83, 150, 109, 125, 239, 230, 98, 232, 63, 163, 201, 124, 38, 127, 153, 82, 94, 15, 173, 94, 177, 226, 194, 232, 181, 254, 108, 39, 31, 193, 56, 93, 234, 168, 191, 123, 206, 5, 193, 47, 24, 75, 27, 219, 79, 170, 5, 18, 28, 147, 78, 98, 39];

export const ISSUER_DID = 'did:key:GGBX4K2roNY1E8VPes6xCuP5iqJNfFbUtH2oByxaHH9g';
export const SUBJECT_JEY = [155, 84, 64, 152, 86, 197, 245, 103, 230, 47, 136, 5, 26, 201, 42, 24, 29, 132, 219, 148, 104, 40, 88, 189, 172, 194, 46, 125, 230, 164, 113, 160, 37, 89, 226, 210, 250, 82, 249, 120, 78, 80, 194, 93, 114, 250, 15, 78, 221, 156, 255, 234, 200, 80, 81, 115, 165, 90, 246, 182, 77, 150, 108, 66];
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
