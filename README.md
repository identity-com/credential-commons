# Identity.com Verifiable Credential Library

[![CircleCI](https://circleci.com/gh/identity-com/credential-commons.svg?style=svg)](https://circleci.com/gh/identity-com/credential-commons)
[![NPM](https://img.shields.io/npm/v/%40identity.com/credential-commons.svg)](https://www.npmjs.com/package/@identity.com/credential-commons)

## Contents
- [Summary](#summary)
- [Installation](#installation)
- [Commands](#commands)
- [Features](#features)
  - [User Collectable Attributes](#user-collectable-attributes)
    - [Using a Claim in javascript (with this library)](#using-a-claim-in-javascript-with-this-library)
      - [Creating Claim instances with the async create function](#creating-claim-instances-with-the-async-create-function)
  - [Credentials](#credentials)
    - [Using a VerifiableCredential in javascript (with this library)](#using-a-verifiablecredential-in-javascript-with-this-library)
      - [creating VerifiableCredential instances with the constructor](#creating-verifiablecredential-instances-with-the-constructor)
      - [creating VerifiableCredential with evidence](#creating-verifiablecredential-with-evidence)
      - [Anchoring VerifiableCredential instances with the constructor](#anchoring-verifiablecredential-instances-with-the-constructor)
      - [Refreshing an anchor (temp => permanent) VerifiableCredential instances with the constructor](#refreshing-an-anchor-temp--permanent-verifiablecredential-instances-with-the-constructor)
    - [Granting the Credential Usage(for single user) from the owner](#granting-the-credential-usagefor-single-user-from-the-owner)
      - [Granting](#granting)
      - [Verify if is Granted](#verify-if-is-granted)
      - [Verifiable Credential Sample](#verifiable-credential-sample)
      - [Construting a VerifiableCredential from a JSON](#construting-a-verifiablecredential-from-a-json)
      - [Verifying a Verifiable Credential](#verifying-a-verifiable-credential)
- [Loading schemas](#loading-schemas)
- [Conventions:](#conventions)
- [Releases](#releases)

## Summary

This Javascript Library provides functionality around Verifiable Credentials (VC), a W3C standard. Enables Validators 
to issue, Credential Wallets to verify, filter and Requesters to verify credentials.

## Installation
Credential commons is an open-source library that has its binary package published on NPM.
Projects that depend on credential-commons must install the dependency following this way:
`npm install --save @identity.com/credential-commons`

All versions follow SemVer (https://semver.org/)

## Commands

- `npm run lint` - run an ESLint check
- `npm run coverage` - run code coverage and generate report in the `coverage` folder
- `npm test` - run all tests
- `npm run test:watch` - run all tests in watch mode
- `npm run audit-ci` - run audit checks

## Features

### User Collectable Attributes

A "User Collectable Attribute" is **a unit of user-related data** (attribute or knowledge) with a specific identifier that can be captured from the user normally during mobile app. A Claim once verified can be part of a Credential as Claim with the same identifier.

#### Using a Claim in javascript (with this library)

##### Creating Claim instances with the async `create` function

`Claim.create(identifier, value)`

Example
```
const name = await Claim.create('claim-cvc:Identity.address-v1', {
    street: 'Alameda dos Anjos',
    unit: '102',
    city: 'Belo Horizonte',
    zipCode: '94103345',
    state: 'Minas Gerais',
    county: 'Sao Bento',
    country: 'Brazil',
});
```

**values** can be:
*  Plain JavaScript Objects:
```json
{
    "street": "Alameda dos Anjos",
    "unit": "102",
    "city": "Belo Horizonte",
    "zipCode": "94103345",
    "state": "Minas Gerais",
    "county": "Sao Bento",
    "country": "Brazil",
}
```
* Attestable Values: 
```json
{
  "attestableValue": "urn:city:508e6c84091b405587f755eb5e0d9dbd15f4f7f69642adc18d2d2d8fe9c93366:Belo Horizonte|urn:country:f53c0e02620611705f5dfab2abe8320679f183f7eaa01b50340b6f0f0579638f:Brazil|urn:county:a9d100b24769843e15d8fff52efc5d15f57150e1c252d99c0ea7f8d6ed740e4a:Sao Bento|urn:state:73d0477e24c5b3498addf6877c52ae5916b7cf9fbcaea2e2d440167e4745fab2:Minas Gerais|urn:street:71cb22a895ee6264ed2f0cc851a9e17c5326f70bfd94e945e319d03f361d47d9:Alameda dos Anjos|urn:unit:887eb71750da1837101eb64c821f0a0a58e7ab3254eeed1b6bf2cec72b7a4174:102|urn:zipCode:dc671959502dfa65de57a0a8176da15437493c37497670445268e286a035bea8:94103345|"
}
```

### Credentials

A Credential with an associated Proof. Every consumer of a verifiable Credentials must be able to verify those 
independently. Holders of Credentials (aka Mobile Phones) are creating "Verifiable Credentials" for Inspectors 
(aka Requesters).

#### Using a VerifiableCredential in javascript (with this library)

##### creating VerifiableCredential instances with the constructor

To construct a new VC you need first to get instances of all Claim dependencies
```javascript
const name = await Claim.create('claim-cvc:Identity.name-v1', { first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
const cred = await VC.create('cvc:cred:Test', 'jest:test', null, [name, dob]);
```

##### creating VerifiableCredential with evidence

Evidence can be included in a verifiable credential to provide the verifier with additional supporting information. For more details, please refer to the [Evidence session in Verifiable Credential Data Model 1.0](https://www.w3.org/TR/verifiable-claims-data-model/#evidence).

The evidence is an optional parameter on VC construction:
```javascript
const name = await Claim.create('claim-cvc:Identity.name-v1', { first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
const evidence = {
  id: 'https://idv.civic.com/evidence/f2aeec97-fc0d-42bf-8ca7-0548192dxyzab',
  type: ['DocumentVerification'],
  verifier: 'did:ethr:xxx',
  evidenceDocument: 'Brazilian Passport',
  subjectPresence: 'Digital',
  documentPresence: 'Digital',
};

const cred = await VC.create('cvc:cred:Test', 'jest:test', null, [name, dob], '1', evidence);
```

##### Anchoring VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all Claim dependencies
```javascript
const name = await Claim.create('claim-cvc:Identity.name-v1', { first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
const cred = await VC.create('cvc:cred:Test', 'jest:test', [name, dob]);
cred.requestAnchor().then(() => {
  //The original instance is updated
})
```

##### Refreshing an anchor (temp => permanent) VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all Claim dependencies
```javascript
const name = await Claim.create('claim-cvc:Identity.name-v1', { first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = await Claim.create('claim-cvc:Identity.dateOfBirth-v1', { day: 20, month: 3, year: 1978 });
const cred = await VC.create('cvc:cred:Test', 'jest:test', [name, dob]);
cred.updateAnchor().then(() => {
  //The original instance is updated
})
```

#### Granting the Credential Usage(for single user) from the owner
Since the Verifiable Credential is an immutable structure that is anchored on an immutable database(blockchain), 
someone can ask "What if someone else gets a copy of the VC and tries to use it later as if they are the owner?"

To prevent that to happen is important that the owner always grant the usage of the credential *for a single time only*.
And the entity that is receiving the VC has always to verify if the credential is granted for that specific request.

The library provide ways to do both.

##### Granting
```javascript
cred.grantUsageFor(requestorId, requestId)
```
this updates the credential with a `granted` section. where: 
```javascript
granted = hex_encoded(sign(SHA256(`${cred.proof.anchor.subject.label}${cred.proof.anchor.subject.data}${requestorId}${requestId}`)))
````
 
##### Verify if is Granted
````javascript
cred.verify(VERIFY_LEVELS.GRANTED | VERIFY_LEVELS.BLOCKCHAIN), options)
````
Where `options` may contatins:
```
{ 
  "requestorId" = "", // If GRANTED is requested, `requestorId` should be provided to the verification
  "requestId" = "", // If GRANTED is requested, `requestId` (the nonce) should be provided to the verification
  "keyName" = "", // Optional. If a custom CryptoManager is provided, the `keyName` shoud be passed and will be used to verify the "granted" field.
}
```

##### Verifiable Credential Sample
```json
{
  "id": "fc60be8f-ea01-4881-a6e9-b4ae9a63e55e",
  "issuer": "jest:test:9ff1e700-dd46-11e8-958d-e5793374641e",
  "issuanceDate": "2018-10-31T19:53:23.568Z",
  "identifier": "credential-cvc:PhoneNumber-v3",
  "version": "1",
  "type": [
    "VerifiableCredential",
    "IdentityCredential"
  ],
  "credentialSubject": {
    "id": "did:sol:J2vss1hB3kgEfQMSSdvvjwRm3JdyFWp7S7dbX5mudS4V",
    "contact": {
      "phoneNumber": {
        "country": "WTYqO3zRU0",
        "countryCode": "nmQfVTPkEM",
        "extension": "lo6CoXdj2N",
        "lineType": "zkdkjiX1eP",
        "number": "h7CrPkWRoA"
      }
    }
  },
  "proof": {
    "type": "CivicMerkleProof2018",
    "merkleRoot": "77ca9a60724d007173136465fa6bdcaa27d12a1801b1d1e8ab974552344d2e39",
    "anchor": {
      "subject": {
        "pub": "xpub:dummy",
        "label": "credential-cvc:PhoneNumber-v1",
        "data": "77ca9a60724d007173136465fa6bdcaa27d12a1801b1d1e8ab974552344d2e39",
        "signature": "signed:dummy"
      },
      "walletId": "none",
      "cosigners": [
        {
          "pub": "xpub:dummy"
        },
        {
          "pub": "xpub:dummy"
        }
      ],
      "authority": {
        "pub": "xpub:dummy",
        "path": "/"
      },
      "coin": "dummycoin",
      "tx": {},
      "network": "dummynet",
      "type": "permanent",
      "civicAsPrimary": false,
      "schema": "dummy-20180201",
      "value": {}
    },
    "leaves": [
      {
        "identifier": "credential-cvc:PhoneNumber-v1",
        "value": "urn:country:ca3bce5c4b3256888c8fa9937d3025516b49b422112bd99cdaf9be66087984e9:WTYqO3zRU0|urn:countryCode:81a228f771ef72126b22d6d17f08222f4241efedf5f13fbb635d8568686a0b6f:nmQfVTPkEM|urn:extension:42cab0927b370d5ee047152aaf52c902f80d7de312bdeca6e4c4e3d4c6603abc:lo6CoXdj2N|urn:lineType:0a71c9a31246f2f6ecfd76a7c71f34a6f741cef3afb2466cc88017bdc16d95a7:zkdkjiX1eP|urn:number:53a8ba743f83a16e533d5572c24dad080820baef958e80c39899838ba1cdd674:h7CrPkWRoA|",
        "claimPath": "contact.phoneNumber",
        "targetHash": "cc8f00eaf13969a880fe5d57204b509dd7cc087b99019af1c6e678d4fe072499",
        "node": [
          {
            "right": "082eeee25eae17f13a74b4d0801d182f9e490ddd70969d1b1a23a709fe87a184"
          },
          {
            "right": "cd0013b49b3d52aa5c6bf6ac854e77fcac1eab934d4c388ae5837f70172ee91e"
          },
          {
            "right": "a1d95e970de891aa6d227426d071a28f3440ee0a3e99f2a76c1a49193cd999f8"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Phone:countryCode",
        "value": "urn:countryCode:81a228f771ef72126b22d6d17f08222f4241efedf5f13fbb635d8568686a0b6f:nmQfVTPkEM",
        "claimPath": "phone.countryCode",
        "targetHash": "082eeee25eae17f13a74b4d0801d182f9e490ddd70969d1b1a23a709fe87a184",
        "node": [
          {
            "left": "cc8f00eaf13969a880fe5d57204b509dd7cc087b99019af1c6e678d4fe072499"
          },
          {
            "right": "cd0013b49b3d52aa5c6bf6ac854e77fcac1eab934d4c388ae5837f70172ee91e"
          },
          {
            "right": "a1d95e970de891aa6d227426d071a28f3440ee0a3e99f2a76c1a49193cd999f8"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Phone:number",
        "value": "urn:number:53a8ba743f83a16e533d5572c24dad080820baef958e80c39899838ba1cdd674:h7CrPkWRoA",
        "claimPath": "phone.number",
        "targetHash": "bf6403908a22f3e8c5d477498d6828411801280128289ecd8680ea8496a92d4d",
        "node": [
          {
            "right": "1b52b0600694813ce1992fafe6d106d10ecef752721f7c79aae6db6be8eede54"
          },
          {
            "left": "a9cb50eddf122581028336ac675bd83d681eaeda754aced0630e8c765914a656"
          },
          {
            "right": "a1d95e970de891aa6d227426d071a28f3440ee0a3e99f2a76c1a49193cd999f8"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Phone:extension",
        "value": "urn:extension:42cab0927b370d5ee047152aaf52c902f80d7de312bdeca6e4c4e3d4c6603abc:lo6CoXdj2N",
        "claimPath": "phone.extension",
        "targetHash": "1b52b0600694813ce1992fafe6d106d10ecef752721f7c79aae6db6be8eede54",
        "node": [
          {
            "left": "bf6403908a22f3e8c5d477498d6828411801280128289ecd8680ea8496a92d4d"
          },
          {
            "left": "a9cb50eddf122581028336ac675bd83d681eaeda754aced0630e8c765914a656"
          },
          {
            "right": "a1d95e970de891aa6d227426d071a28f3440ee0a3e99f2a76c1a49193cd999f8"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Phone:lineType",
        "value": "urn:lineType:0a71c9a31246f2f6ecfd76a7c71f34a6f741cef3afb2466cc88017bdc16d95a7:zkdkjiX1eP",
        "claimPath": "phone.lineType",
        "targetHash": "90891289e7dd6c36dd1fc38187fce024899bdd1c20bf857ff1fe439b2bd18754",
        "node": [
          {
            "right": "059d1df65ffdc8a1c0cff86412f716745531466cdd1c9c2c1264364bba325e01"
          },
          {
            "right": "7d167b4360413c5016d7bdf6b080767275e925e07c18f0a16729b882ef245ace"
          },
          {
            "left": "0d4f56aae6f29bab5d8f83fb595673bdc629d5d0973e78b53ad43a1bb1dd9515"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuer",
        "value": "urn:issuer:5bd06324dc242c17e811f56c8d449b4c8f966503811abc1f5a0ff35b876fee2d:jest:test:9ff1e700-dd46-11e8-958d-e5793374641e",
        "claimPath": "meta.issuer",
        "targetHash": "059d1df65ffdc8a1c0cff86412f716745531466cdd1c9c2c1264364bba325e01",
        "node": [
          {
            "left": "90891289e7dd6c36dd1fc38187fce024899bdd1c20bf857ff1fe439b2bd18754"
          },
          {
            "right": "7d167b4360413c5016d7bdf6b080767275e925e07c18f0a16729b882ef245ace"
          },
          {
            "left": "0d4f56aae6f29bab5d8f83fb595673bdc629d5d0973e78b53ad43a1bb1dd9515"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuanceDate",
        "value": "urn:issuanceDate:b8b3000ae66079b85aaadb9adfe6658ae09452f77fb8eefeddf96c40692c8bd7:2018-10-31T19:53:23.568Z",
        "claimPath": "meta.issuanceDate",
        "targetHash": "93c37224a3cd5e6dd47a98e55f42854ee5b3b9fda63f60b8076c57a59bd84f0b",
        "node": [
          {
            "right": "292ed3b6a33a406ae43bf0d43d159a04a5417e1a244017c174194889898de1e1"
          },
          {
            "left": "785d97b0b9fe7809bf55803fc3ded62180e9b01fac15a488ac84e6238eb466f3"
          },
          {
            "left": "0d4f56aae6f29bab5d8f83fb595673bdc629d5d0973e78b53ad43a1bb1dd9515"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:expirationDate",
        "value": "urn:expirationDate:a43b2ec05674437f2e440be5c72cfcee323fe544c88e212f4bc6c463a8c35dda:null",
        "claimPath": "meta.expirationDate",
        "targetHash": "292ed3b6a33a406ae43bf0d43d159a04a5417e1a244017c174194889898de1e1",
        "node": [
          {
            "left": "93c37224a3cd5e6dd47a98e55f42854ee5b3b9fda63f60b8076c57a59bd84f0b"
          },
          {
            "left": "785d97b0b9fe7809bf55803fc3ded62180e9b01fac15a488ac84e6238eb466f3"
          },
          {
            "left": "0d4f56aae6f29bab5d8f83fb595673bdc629d5d0973e78b53ad43a1bb1dd9515"
          },
          {
            "right": "ac9e75c2d832091f3b18e974dc224ed5ef970673ed679ff931c1f4a33db3f929"
          },
          {
            "right": "3b2728ce00cdc42c8c524574ab20a8ea1e78efa805bba6e988c10e0c13f77d3f"
          }
        ]
      }
    ],
    "granted": null
  }
}
```

##### Constructing a VerifiableCredential from a JSON
To construct a new VC given a JSON, just use the `.fromJSON` method:
```javascript
const credJSon = require('./ACred.json');
const cred = await VC.fromJSON(credJSon);
```
Now you can access any method of a `cred` instance, like `.updateAnchor()` or `.verify()`

##### Verifying a Verifiable Credential

Remember to check the section about configuration or else this part will fail.

To verify a credential JSON, you can construct a VC using `.fromJSON` and call `.verify()` method:
```javascript
const credJSon = require('./ACred.json');
const cred = await VC.fromJSON(credJSon);
const verifiedLevel = cred.verify();
```

The `.verify(VC.VERIFY_LEVELS.*, options)` method return the hiehighest level verified, follow the `VC.VERIFY_LEVELS` constant:
```javascript
VERIFY_LEVELS = {
  INVALID: -1, // Verifies if the VC structure and/or signature proofs is not valid, or credential is expired
  PROOFS: 0, // Verifies if the VC structure  and/or signature proofs are valid, including the expiry
  ANCHOR: 1, // Verifies if the VC Attestation Anchor structure is valid
  GRANTED: 2, // Verifies if the owner granted the VC usage for a specific request
  BLOCKCHAIN: 3, // Verifies if the VC Attestation is valid on the blockchain
};
```

## Loading schemas

All claims and credentials are validated against a JSON schemas. The source of these schema's and how they are loaded
needs to be provided. One of more schea loader can be provided as follows:

```javascript
const { schemaLoader } = require('@identity/credential-commons');
schemaLoader.addLoader(new SchemaLoader1())
schemaLoader.addLoader(new SchemaLoader2())
```

The provided SchemaLoader needs to conform to the following interface:
```typescript
interface SchemaLoader {
  // Returns a boolean if the schema loader can load the supplied identitifier (in the case of multiple loaders)
  valid(identifier): boolean;
  
  // Returns the schema id for the provided identifier (e.g. http://identity.com/schemas/claim-cvc:Identity.address-v1)
  schemaId(identifier): string;
  
  // Load the schema based on the provided identifier and returns the schema as an object
  loadSchema(identifier): Promise<any | null>
}
```

A default schema loaded is provided [here](/src/schemas/jsonSchema/loaders/cvc.js)

## Conventions:

* We use draft 7 for the json schemas

* Values that can have null, must have `type : ['null','string']` or else they fail validation if you only send null or if you send an value

* All simple objects String, Number are required as default

* Accepted json schema keywords on identifiers: pattern, maximum, minimum, exclusiveMinimum, exclusiveMaximum, required

* If an identifier has a pattern it must be an Javascript Regex

## Releases

The release process is fully automated and started by Civic members when it's created a tag on Github following the pattern ^release\\..*$. E.g.: `release.1`.

After the creation of the tag, Circle Ci will trigger a job to:

build source files
run unit tests
increase version number on package.json
create the stable version and tag it. E.g: v0.2.29
remove the release.N tag
deploy the binary file to NPM
