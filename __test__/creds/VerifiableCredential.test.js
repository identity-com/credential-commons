const _ = require('lodash');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
const { Claim, definitions } = require('../../src/claim/Claim');
const VC = require('../../src/creds/VerifiableCredential');
const credentialDefinitions = require('../../src/creds/definitions');
const SchemaGenerator = require('../../src/schemas/generator/SchemaGenerator');

jest.setTimeout(150000);

describe('Unit tests for Verifiable Credentials', () => {
  test('Dont construct undefined Credentials', () => {
    function createCredential() {
      const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
      const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
      return new VC('cvc:cred:Test', uuidv4(), null, [name, dob], '1');
    }
    expect(createCredential).toThrowError('cvc:cred:Test is not defined');
  });
  test('Dont construct Credentials with wrong version', () => {
    function createCredential() {
      const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
      const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
      return new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '2');
    }
    expect(createCredential).toThrowError('Credential definition for cvc:Credential:Identity v2 not found');
  });
  test('New Defined Credentials', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claim.identity.name.givenNames).toBe('Joao');
    expect(cred.claim.identity.name.otherNames).toBe('Barbosa');
    expect(cred.claim.identity.name.familyNames).toBe('Santos');
    expect(cred.claim.identity.dateOfBirth.day).toBe(20);
    expect(cred.claim.identity.dateOfBirth.month).toBe(3);
    expect(cred.claim.identity.dateOfBirth.year).toBe(1978);
    expect(cred.proof.leaves).toHaveLength(8);
  });

  // This test was skipped cause in the current definitions we don't have this case any more
  test.skip('should validate new defined credentials with the obligatory Meta:expirationDate UCA with'
    + ' null value', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claim.identity.name.givenNames).toBe('Joao');
    expect(cred.claim.identity.name.otherNames).toBeUndefined();
    expect(cred.claim.identity.name.familyNames).toBe('Santos');
    expect(cred.claim.identity.dateOfBirth.day).toBe(20);
    expect(cred.claim.identity.dateOfBirth.month).toBe(3);
    expect(cred.claim.identity.dateOfBirth.year).toBe(1978);
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:issuanceDate' })).toBeDefined();
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:expirationDate' })).toBeDefined();
    expect(cred.expirationDate).toBeNull();
    expect(cred.proof.leaves).toHaveLength(7);
  });
  test('New Expirable Credentials', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), '-1d', [name, dob], '1');
    expect(cred).toBeDefined();
    expect(cred.claim.identity.name.givenNames).toBe('Joao');
    expect(cred.claim.identity.name.otherNames).toBe('Barbosa');
    expect(cred.claim.identity.name.familyNames).toBe('Santos');
    expect(cred.claim.identity.dateOfBirth.day).toBe(20);
    expect(cred.claim.identity.dateOfBirth.month).toBe(3);
    expect(cred.claim.identity.dateOfBirth.year).toBe(1978);
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:issuer' })).toBeDefined();
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:issuanceDate' })).toBeDefined();
    expect(cred.expirationDate).toBeDefined();
    expect(_.find(cred.proof.leaves, { identifier: 'cvc:Meta:expirationDate' })).toBeDefined();
    expect(cred.proof.leaves).toHaveLength(8);
  });
  test('New Defined Credentials return the incorrect global Credential Identifier', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred.getGlobalCredentialItemIdentifier()).toBe('credential-cvc:Credential:Identity-1');
  });

  it('should request an anchor for Credential and return an temporary attestation', async (done) => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), '-1d', [name, dob], '1');
    return cred.requestAnchor().then((updated) => {
      expect(updated.proof.anchor.type).toBe('temporary');
      expect(updated.proof.anchor.value).not.toBeDefined();
      expect(updated.proof.anchor).toBeDefined();
      expect(updated.proof.anchor.schema).toBe('dummy-20180201');
      done();
    });
  });
  it('should refresh an temporary anchoring with an permanent one', async (done) => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');

    cred.requestAnchor = jest.fn().mockImplementation(async () => {
      // mock the function or otherwise it would call the server
      const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
      const mockedVc = VC.fromJSON(JSON.parse(credentialContents));
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

  test('Filter claims from Identity Name', () => {
    const civIdentityName = {
      givenNames: 'Joao',
      otherNames: 'Barbosa',
      familyNames: 'Santos',
    };

    const civIdentityDateOfBirth = {
      day: 20,
      month: 3,
      year: 1978,
    };
    const nameUca = new Claim.IdentityName(civIdentityName);

    const dobUca = new Claim('cvc:Identity:dateOfBirth', civIdentityDateOfBirth);
    const simpleIdentity = new VC('cvc:Credential:Identity', 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
      null, [nameUca, dobUca], '1');

    const filtered = simpleIdentity.filter(['cvc:Name:givenNames']);
    expect(filtered.claim.identity.name.givenNames).toBeDefined();
    expect(filtered.claim.identity.name.otherNames).not.toBeDefined();
    expect(filtered.claim.identity.name.familyNames).not.toBeDefined();

    const emptyFiltered = simpleIdentity.filter([]);
    expect(emptyFiltered.claim).toEqual({});
  });

  it('Should filter claims for Email asking for cvc:Contact:email and return them on the filtered VC', () => {
    const email = {
      domain: {
        tld: 'oVaPsceZ4C',
        name: 'UTpHKFyaaB',
      },
      username: 'ZcMpCBQ0lE',
    };

    const emailUca = new Claim('cvc:Contact:email', email, '1');
    const emailCredential = new VC('cvc:Credential:Email', '', null, [emailUca], '1');
    const filtered = emailCredential.filter(['cvc:Contact:email']);
    expect(filtered.claim.contact.email.domain).toBeDefined();
    expect(filtered.claim.contact.email.domain.tld).toBe('oVaPsceZ4C');
    expect(filtered.claim.contact.email.domain.name).toBe('UTpHKFyaaB');
    expect(filtered.claim.contact.email.username).toBe('ZcMpCBQ0lE');
  });

  it('Should filter claims for Email asking for cvc:Contact:domain and not return the cvc:Contact:address', () => {
    const email = {
      domain: {
        tld: 'oVaPsceZ4C',
        name: 'UTpHKFyaaB',
      },
      username: 'ZcMpCBQ0lE',
    };

    const emailUca = new Claim('cvc:Contact:email', email, '1');
    const emailCredential = new VC('cvc:Credential:Email', '', null, [emailUca], '1');
    const filtered = emailCredential.filter(['cvc:Email:domain']);

    expect(filtered.claim.contact.email.domain).toBeDefined();
    expect(filtered.claim.contact.email.domain.tld).toBe('oVaPsceZ4C');
    expect(filtered.claim.contact.email.domain.name).toBe('UTpHKFyaaB');
    expect(filtered.claim.contact.email.username).toBeUndefined();
  });

  it('Should filter claims for Address asking for cvc:Type:address and return the cvc:Type:address', () => {
    const value = {
      country: 'X2sEB9F9W9',
      county: 'sDlIM4Rjpo',
      state: 'ZZEOrbenrM',
      street: 'JkHgN5gdZ2',
      unit: 'fo9OmPSZNe',
      city: 'LVkRGsKqIf',
      postalCode: '5JhmWkXBAg',
    };

    const uca = new Claim('cvc:Identity:address', value, '1');
    const credential = new VC('cvc:Credential:Address', '', null, [uca], '1');
    const filtered = credential.filter(['cvc:Identity:address']);

    expect(filtered.claim.identity.address).toBeDefined();
    expect(filtered.claim.identity.address.country).toBe('X2sEB9F9W9');
    expect(filtered.claim.identity.address.county).toBe('sDlIM4Rjpo');
    expect(filtered.claim.identity.address.state).toBe('ZZEOrbenrM');
    expect(filtered.claim.identity.address.street).toBe('JkHgN5gdZ2');
    expect(filtered.claim.identity.address.unit).toBe('fo9OmPSZNe');
    expect(filtered.claim.identity.address.city).toBe('LVkRGsKqIf');
    expect(filtered.claim.identity.address.postalCode).toBe('5JhmWkXBAg');
  });

  it('Should filter claims for PhoneNumber asking for cvc:Contact:phoneNumber and return the full claim', () => {
    const value = {
      country: '1ApYikRwDl',
      countryCode: 'U4drpB96Hk',
      number: 'kCTGifTdom',
      extension: 'sXZpZJTe4R',
      lineType: 'OaguqgUaR7',
    };

    const uca = new Claim('cvc:Contact:phoneNumber', value, '1');
    const credential = new VC('cvc:Credential:PhoneNumber', '', null, [uca], '1');
    const filtered = credential.filter(['cvc:Contact:phoneNumber']);

    expect(filtered.claim.contact.phoneNumber).toBeDefined();
    expect(filtered.claim.contact.phoneNumber.country).toBe('1ApYikRwDl');
    expect(filtered.claim.contact.phoneNumber.countryCode).toBe('U4drpB96Hk');
    expect(filtered.claim.contact.phoneNumber.extension).toBe('sXZpZJTe4R');
    expect(filtered.claim.contact.phoneNumber.lineType).toBe('OaguqgUaR7');
    expect(filtered.claim.contact.phoneNumber.number).toBe('kCTGifTdom');
  });

  it('Should filter claims for GenericDocumentId asking for cvc:Identity:dateOfBirth and return nothing', () => {
    const typeValue = 'fq6gOJR2rr';
    const type = new Claim('cvc:Document:type', typeValue, '1');
    const numberValue = '3bj1LUg9yG';
    const number = new Claim('cvc:Document:number', numberValue, '1');
    const nameValue = {
      givenNames: 'e8qhs4Iak1',
      familyNames: '4h8sLtEfav',
      otherNames: 'bDTn4stMpX',
    };
    const name = new Claim('cvc:Document:name', nameValue, '1');
    const genderValue = 'jFtCBFceQI';
    const gender = new Claim('cvc:Document:gender', genderValue, '1');
    const issueLocationValue = 'OZbhzBU8ng';
    const issueLocation = new Claim('cvc:Document:issueLocation', issueLocationValue, '1');
    const issueAuthorityValue = 'BO2xblNSVK';
    const issueAuthority = new Claim('cvc:Document:issueAuthority', issueAuthorityValue, '1');
    const issueCountryValue = 'p4dNUeAKtI';
    const issueCountry = new Claim('cvc:Document:issueCountry', issueCountryValue, '1');
    const placeOfBirthValue = 'r4hIHbyLru';
    const placeOfBirth = new Claim('cvc:Document:placeOfBirth', placeOfBirthValue, '1');
    const dateOfBirthValue = {
      day: 23.55661112087767,
      month: 2.3719586174881204,
      year: 1973.1235577195403,
    };
    const dateOfBirth = new Claim('cvc:Document:dateOfBirth', dateOfBirthValue, '1');
    const addressValue = {
      country: 'IH4aiXuEoo',
      county: 'akKjaQehNK',
      state: 'IQB7oLhSnS',
      street: '52Os5zJgkh',
      unit: '3dGDkhEHxW',
      city: 'WU9GJ0R9be',
      postalCode: 'ci1DMuz16W',
    };
    const address = new Claim('cvc:Document:address', addressValue, '1');
    const propertiesValue = {
      dateOfIssue: {
        day: 18.414766065177673,
        month: 6.9617705136467425,
        year: 1928.4150248655972,
      },
      dateOfExpiry: {
        day: 8.552112724932464,
        month: 0.8142652052451673,
        year: 1957.6252772045032,
      },
    };
    const properties = new Claim('cvc:Document:properties', propertiesValue, '1');
    const imageValue = {
      front: '9NMgeFErNd',
      frontMD5: 'zgOvmWXruS',
      back: 'uPrJKO3cbq',
      backMD5: '0yr9zkdApo',
    };
    const image = new Claim('cvc:Document:image', imageValue, '1');
    const credential = new VC('cvc:Credential:GenericDocumentId', '', null, [type, number, name, gender, issueAuthority,
      issueLocation, issueCountry, placeOfBirth, properties, address, image, dateOfBirth], '1');
    const filtered = credential.filter(['cvc:Identity:dateOfBirth']);

    expect(filtered.claim.document).toBeUndefined();
  });

  it('Should filter claims for PhoneNumber asking for cvc:Phone:countryCode and return only the'
    + ' claim for country code', () => {
    const value = {
      country: '1ApYikRwDl',
      countryCode: 'U4drpB96Hk',
      number: 'kCTGifTdom',
      extension: 'sXZpZJTe4R',
      lineType: 'OaguqgUaR7',
    };

    const uca = new Claim('cvc:Contact:phoneNumber', value, '1');
    const credential = new VC('cvc:Credential:PhoneNumber', '', null, [uca], '1');
    const filtered = credential.filter(['cvc:PhoneNumber:countryCode']);

    expect(filtered.claim.contact.phoneNumber).toBeDefined();
    expect(filtered.claim.contact.phoneNumber.country).toBeUndefined();
    expect(filtered.claim.contact.phoneNumber.countryCode).toBe('U4drpB96Hk');
    expect(filtered.claim.contact.phoneNumber.extension).toBeUndefined();
    expect(filtered.claim.contact.phoneNumber.lineType).toBeUndefined();
    expect(filtered.claim.contact.phoneNumber.number).toBeUndefined();
  });

  it('Should filter claims for GenericDocumentId asking for cvc:Document:Type and return only that claim', () => {
    const typeValue = 'fq6gOJR2rr';
    const type = new Claim('cvc:Document:type', typeValue, '1');
    const numberValue = '3bj1LUg9yG';
    const number = new Claim('cvc:Document:number', numberValue, '1');
    const nameValue = {
      givenNames: 'e8qhs4Iak1',
      familyNames: '4h8sLtEfav',
      otherNames: 'bDTn4stMpX',
    };
    const name = new Claim('cvc:Document:name', nameValue, '1');
    const genderValue = 'jFtCBFceQI';
    const gender = new Claim('cvc:Document:gender', genderValue, '1');
    const issueLocationValue = 'OZbhzBU8ng';
    const issueLocation = new Claim('cvc:Document:issueLocation', issueLocationValue, '1');
    const issueAuthorityValue = 'BO2xblNSVK';
    const issueAuthority = new Claim('cvc:Document:issueAuthority', issueAuthorityValue, '1');
    const issueCountryValue = 'p4dNUeAKtI';
    const issueCountry = new Claim('cvc:Document:issueCountry', issueCountryValue, '1');
    const placeOfBirthValue = 'r4hIHbyLru';
    const placeOfBirth = new Claim('cvc:Document:placeOfBirth', placeOfBirthValue, '1');
    const dateOfBirthValue = {
      day: 23,
      month: 2,
      year: 1973,
    };
    const dateOfBirth = new Claim('cvc:Document:dateOfBirth', dateOfBirthValue, '1');
    const addressValue = {
      country: 'IH4aiXuEoo',
      county: 'akKjaQehNK',
      state: 'IQB7oLhSnS',
      street: '52Os5zJgkh',
      unit: '3dGDkhEHxW',
      city: 'WU9GJ0R9be',
      postalCode: 'ci1DMuz16W',
    };
    const address = new Claim('cvc:Document:address', addressValue, '1');
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
    const properties = new Claim('cvc:Document:properties', propertiesValue, '1');
    const imageValue = {
      front: '9NMgeFErNd',
      frontMD5: 'zgOvmWXruS',
      back: 'uPrJKO3cbq',
      backMD5: '0yr9zkdApo',
    };
    const image = new Claim('cvc:Document:image', imageValue, '1');
    const credential = new VC('cvc:Credential:GenericDocumentId', '', null, [type, number, name, gender, issueAuthority,
      issueLocation, issueCountry, placeOfBirth, properties, address, image, dateOfBirth], '1');
    const filtered = credential.filter(['cvc:Document:type']);

    expect(filtered.claim.document.type).toBe('fq6gOJR2rr');
  });

  it('Should verify an VC of type Email', () => {
    const credJSon = require('./fixtures/Email.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  it('Should verify an VC of type Address', () => {
    const credJSon = require('./fixtures/Address.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  it('Should verify an VC of type Identity', () => {
    const credJSon = require('./fixtures/Identity.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  it('Should verify an VC of type GenericDocumentId and doing VC.fromJSON', () => {
    const credJSon = require('./fixtures/GenericDocumentId.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  it('Should verify an VC of type GenericDocumentId', () => {
    const ucaArray = [];
    const credentialDefinition = credentialDefinitions.find(definition => definition.identifier
      === 'cvc:Credential:GenericDocumentId');
    credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
      const ucaDefinition = definitions.find(ucaDef => ucaDef.identifier === ucaDefinitionIdentifier);
      const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
      let value = ucaJson;
      if (Object.keys(ucaJson).length === 1) {
        [value] = Object.values(ucaJson);
      }
      const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
      ucaArray.push(dependentUca);
    });
    const credential = new VC(credentialDefinition.identifier, 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
      null, ucaArray, 1);
    expect(credential).toBeDefined();
    expect(credential.verifyProofs()).toBeTruthy();
  });

  it('Should verify an VC of type PhoneNumber', () => {
    const credJSon = require('./fixtures/PhoneNumber.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  test('cred.verify(): with a valid cred without expirationDate, should return at least'
    + ' VERIFY_LEVELS.PROOFS level', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verify()).toBeGreaterThanOrEqual(VC.VERIFY_LEVELS.PROOFS);
  });


  test('cred.verify(): VERIFY_LEVELS.PROOFS without expirationDate INVALID', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    // messing up with the targetHash:
    credJSon.proof.leaves[0].targetHash = credJSon.proof.leaves[0].targetHash.replace('a', 'b');
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verify()).toEqual(VC.VERIFY_LEVELS.INVALID);
  });

  it('should fail verification since it doesn\'t have an Meta:expirationDate UCA', () => {
    const credJSon = require('./fixtures/Cred1.json'); // eslint-disable-line
    // messing up with the targetHash:
    credJSon.proof.leaves[0].targetHash = credJSon.proof.leaves[0].targetHash.replace('a', 'b');
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeFalsy();
  });

  test('cred.verifyProofs(): with a valid cred with expirationDate, should return TRUE', () => {
    const credJSon = require('./fixtures/CredWithFutureExpiry.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).toBeTruthy();
  });

  test('cred.verifyProofs(): with a valid cred but expired, should return FALSE', () => {
    const credJSon = require('./fixtures/CredExpired.json'); // eslint-disable-line
    const cred = VC.fromJSON(credJSon);
    expect(cred).toBeDefined();
    expect(cred.verifyProofs()).not.toBeTruthy();
  });

  it('should fail verification since the leaf value is tampered', () => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCWithTamperedLeafValue.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred.verifyProofs()).not.toBeTruthy();
  });

  it('should check that signature matches for the root of the Merkle Tree', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    expect(await cred.verifySignature()).toBeTruthy();
    done();
  });

  it.skip('should tamper the root of Merkle and the signature should not match', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    // tamper merkle root
    cred.proof.merkleRoot = 'gfdagfagfda';
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    expect(await cred.verifySignature()).toBeFalsy();
    done();
  });

  it('should check that the anchor exists on the chain', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    const validation = await cred.verifyAttestation();
    expect(validation).toBeTruthy();
    done();
  });

  it.skip('should fail the check that the anchor exists on the chain', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCTempAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    const validation = await cred.verifyAttestation();
    expect(validation).toBeFalsy();
    done();
  });

  it('should fail the check with temporary attestations faked as permanent', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/CredentialAttestationFaked.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    try {
      await cred.verifyAttestation();
    } catch (err) {
      // TODO jests does not work with assert from node
      expect(err.message).toBe('Could not verify authority signature');
    }
    done();
  });

  it('should revoke the permanent anchor and succed verification', async (done) => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    await cred.requestAnchor();
    await cred.updateAnchor();
    const validation = await cred.verifyAttestation();
    if (validation) {
      const isRevoked = await cred.revokeAttestation();
      expect(isRevoked).toBeTruthy();
    }
    done();
  });

  it('should check an unrevoked attestation and validate that is not revoked', async (done) => {
    const credentialContents = fs.readFileSync('__test__/creds/fixtures/VCPermanentAnchor.json', 'utf8');
    const credentialJson = JSON.parse(credentialContents);
    const cred = VC.fromJSON(credentialJson);
    expect(cred).toBeDefined();
    expect(cred.proof.anchor).toBeDefined();
    const isRevoked = await cred.isRevoked();
    expect(isRevoked).toBeFalsy();
    done();
  });


  it('Should match with one constraint', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred.isMatch({
      claims: [
        { path: 'identity.name.givenNames', is: { $eq: 'Joao' } },
      ],
    })).toBeTruthy();
  });

  it('Should match with two constraint', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred.isMatch({
      claims: [
        { path: 'identity.name.givenNames', is: { $eq: 'Joao' } },
        { path: 'identity.name.otherNames', is: { $eq: 'Barbosa' } },
      ],
    })).toBeTruthy();
  });

  it('Should match with gt constraint', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred.isMatch({
      claims: [
        { path: 'identity.dateOfBirth.year', is: { $gt: 1900 } },
      ],
    })).toBeTruthy();
  });

  it('Should not match', () => {
    const name = new Claim.IdentityName({ givenNames: 'Joao', otherNames: 'Barbosa', familyNames: 'Santos' });
    const dob = new Claim.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
    const cred = new VC('cvc:Credential:Identity', uuidv4(), null, [name, dob], '1');
    expect(cred.isMatch({
      claims: [
        { path: 'identity.name.first', is: { $eq: 'Savio' } },
      ],
    })).toBeFalsy();
  });

  it('Should match credential on constraints.meta', () => {
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
      },
    };

    expect(VC.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
  });

  it('Should match credential on constraints.meta with issuer', () => {
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
            $eq: 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD',
          },
        },
      },
    };

    expect(VC.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
  });

  it('Should match credential on constraints.meta with multiple fileds', () => {
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

    expect(VC.isMatchCredentialMeta(vcMeta, constraints)).toBeTruthy();
  });

  it('Should not match credential on constraints.meta with invalid filed', () => {
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

    expect(VC.isMatchCredentialMeta(vcMeta, constraints)).toBeFalsy();
  });


  it('Should not match credential if constraints invalid or empty', () => {
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
    expect(VC.isMatchCredentialMeta(vcMeta, constraint)).toBeFalsy();
  });

  it('Should return all Credential properties for cvc:Credential:GenericDocumentId', () => {
    const properties = VC.getAllProperties('cvc:Credential:GenericDocumentId');
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

  it('Should return all Credential properties for cvc:Credential:Identity', () => {
    const properties = VC.getAllProperties('cvc:Credential:Identity');
    expect(properties).toHaveLength(6);
    expect(properties).toContain('identity.name.givenNames');
    expect(properties).toContain('identity.name.familyNames');
    expect(properties).toContain('identity.name.otherNames');
    expect(properties).toContain('identity.dateOfBirth.day');
    expect(properties).toContain('identity.dateOfBirth.month');
    expect(properties).toContain('identity.dateOfBirth.year');
  });

  it('Should return all Credential properties for cvc:Credential:Address', () => {
    const properties = VC.getAllProperties('cvc:Credential:Address');
    expect(properties).toHaveLength(7);
    expect(properties).toContain('identity.address.country');
    expect(properties).toContain('identity.address.county');
    expect(properties).toContain('identity.address.state');
    expect(properties).toContain('identity.address.street');
    expect(properties).toContain('identity.address.unit');
    expect(properties).toContain('identity.address.city');
    expect(properties).toContain('identity.address.postalCode');
  });

  it('Should return all Credential properties for cvc:Credential:phoneNumber', () => {
    const properties = VC.getAllProperties('cvc:Credential:PhoneNumber');
    expect(properties).toHaveLength(5);
    expect(properties).toContain('contact.phoneNumber.country');
    expect(properties).toContain('contact.phoneNumber.countryCode');
    expect(properties).toContain('contact.phoneNumber.number');
    expect(properties).toContain('contact.phoneNumber.extension');
    expect(properties).toContain('contact.phoneNumber.lineType');
  });

  it('Should return all Credential properties for cvc:Credential:email', () => {
    const properties = VC.getAllProperties('cvc:Credential:Email');
    expect(properties).toHaveLength(3);
    expect(properties).toContain('contact.email.username');
    expect(properties).toContain('contact.email.domain.name');
    expect(properties).toContain('contact.email.domain.tld');
  });

  it('Should generate each VC and test the empty filtering', async (done) => {
    const validateSchemaJestStep = async (credentialDefinition) => {
      const ucaArray = [];
      credentialDefinition.depends.forEach((ucaDefinitionIdentifier) => {
        const ucaDefinition = definitions.find(ucaDef => (
          ucaDef.identifier === ucaDefinitionIdentifier
        ));
        const ucaJson = SchemaGenerator.buildSampleJson(ucaDefinition);
        let value = ucaJson;
        if (Object.keys(ucaJson).length === 1) {
          [value] = Object.values(ucaJson);
        }
        const dependentUca = new Claim(ucaDefinition.identifier, value, ucaDefinition.version);
        ucaArray.push(dependentUca);
      });
      const credential = new VC(credentialDefinition.identifier, `jest:test:${uuidv1()}`, null, ucaArray, 1);

      await credential.requestAnchor();
      await credential.updateAnchor();

      const filteredCredential = credential.filter([]);
      return Object.keys(filteredCredential.claim).length === 0
        && filteredCredential.verify() === VC.VERIFY_LEVELS.PROOFS;
    };
    const promises = [];
    credentialDefinitions.forEach((credentialDefinition) => {
      promises.push(validateSchemaJestStep(credentialDefinition));
    });
    Promise.all(promises).then((values) => {
      values.forEach(isValid => expect(isValid).toBeTruthy());
      done();
    });
  });
});
