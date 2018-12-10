# Identity.com Verifiable Credential Library

*Warning:* this still is a working in progress and is not ready for usage yet. Please feel free to explore the code but don't integrate yet. We expect API changes before the 1st release.

[![CircleCI](https://circleci.com/gh/identity-com/credential-commons.svg?style=svg)](https://circleci.com/gh/identity-com/credential-commons)
[![NPM](https://img.shields.io/npm/v/%40identity.com/credential-commons.svg)](https://www.npmjs.com/package/@identity.com/credential-commons)


## Summary

This Javascript Library provides functionality around Verifiable Credentials (VC), a W3C standard. Enables Validators to issue, Credential Wallets to verify, filter and Requesters to verify credentials.

## Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Commands](#commands)
- [Configuration](#configuration)
  * [Etc Config File /etc/civic/config](#etc-config-file--etc-civic-config)
  * [User Config File ~/.civic/config](#user-config-file---civic-config)
- [Features](#features)
  * [User Collectable Attributes](#user-collectable-attributes)
    + [Defining new UCA](#defining-new-uca)
    + [Exporting UCA to the UCA Registry Services](#exporting-uca-to-the-uca-registry-services)
    + [Using a UCA in javascript (with this library)](#using-a-uca-in-javascript--with-this-library-)
      - [creating UCA instances with the constructor](#creating-uca-instances-with-the-constructor)
  * [Credentials](#credentials)
    + [Defining new UCA](#defining-new-uca-1)
    + [Exporting UCA to the UCA Registry Services](#exporting-uca-to-the-uca-registry-services-1)
    + [Using a VerifiableCredential in javascript (with this library)](#using-a-verifiablecredential-in-javascript--with-this-library-)
      - [creating VerifiableCredential instances with the constructor](#creating-verifiablecredential-instances-with-the-constructor)
      - [anchoring VerifiableCredential instances with the constructor](#anchoring-verifiablecredential-instances-with-the-constructor)
      - [refreshing an anchor (temp => permanent) VerifiableCredential instances with the constructor](#refreshing-an-anchor--temp----permanent--verifiablecredential-instances-with-the-constructor)
      - [Verifiable Credential Sample](#verifiable-credential-sample)
      - [Construting a VerifiableCredential from a JSON](#construting-a-verifiablecredential-from-a-json)
      - [Verifying a Verifiable Credential](#verifying-a-verifiable-credential)
- [Schema Generator](#schema-generator)
- [Conventions:](#conventions-)
- [Commands](#commands)
- [Integration with CCS Libraries](#integration-with-ccs-libraries)
- [ES5 and ES6 definitions](#es5-and-es6-definitions)
- [Node vs React usage of this library](#node-vs-react-usage-of-this-library)
- [Releases](#releases)

## Prerequisites

[![npm][npm]][npm-url]
      
- [Node.js](https://nodejs.org/en/)
- SJCL library with ECC binary. Please refer how to build with support after the `npm i` here: https://github.com/bitwiseshiftleft/sjcl/wiki/Getting-Started
- Decrypt the XPrv

```
git clone git@github.com:masonicGIT/sjcl-cli.git
cd sjcl-cli
npm install
node src/index.js decrypt
```

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
- `npm run generate-schema` - run the CLI command and generate all schemas


## Configuration

This library depends on some configuration settings to work properly.
The configuration is made in three different ways that override each other: 
* etc config file
* user config file
* environment's variables, in code (not recommended as you can push that to your repo)
 
There is an utility on cli folder, the configuration.js, just run it:

```bash
node cli/configuration.js
```

And it will store the file like below:

### Etc Config File /etc/civic/config
### User Config File ~/.civic/config

### incode
```
const CCC = require('credential-commons-js');
const ccc = new CCC({
  sipSecurityService: "",
  attestationService: "",
  clientConfig: {
    id: "",
    signingKeys: {
      hexpub: "",
      hexsec: "",
    },
  },
  passphrase: "",
  keychain: { prv: "" },
})
 
```

If you are not sure how to get those informations, see the tutorial down below.

## Features

### User Collectable Attributes

A "User Collectable Attribute" is **a unit of user-related data** (attribute or knowledge) with a specific identifier that can be captured from the user normally during mobile app. A UCA once verified can be part of a Credential as Claim with the same identifier.

#### Defining new UCA

Just add a new definition entry with the [format](http://) on the definitions [file](http://)

#### Exporting UCA to the UCA Registry Services

UCA definitions are packed inside this library but also are available for public consumption at the [UCA Registry](http://) to export new defined UCAs just run:

```
npm run export-definitions 
```  

#### Using a UCA in javascript (with this library)

##### creating UCA instances with the constructor

`UCA(identifier, value, version)`

Example
```
const name = new UCA('cvc:Identity:address', {
    street: 'Alameda dos Anjos',
    unit: '102',
    city: 'Belo Horizonte',
    zipCode: '94103345',
    state: 'Minas Gerais',
    county: 'Sao Bento',
    country: 'Brazil',
}, '1');
```
Or use the shorthand
```
const name = new UCA.IdentityAddress({
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

JSON String
 
```json
{
  "id": null,
  "issuer": "did:ethr:0x1ddcbae835c47c8d9159756c167994931a5f01e8",
  "issuanceDate": "2018-09-25T21:51:56.511Z",
  "identifier": "cvc:Credential:Address",
  "expirationDate": "+132017-07-11T05:51:56.512Z",
  "version": "1",
  "type": [
    "Credential",
    "cvc:Credential:Address"
  ],
  "claim": {
    "type": {
      "address": {
        "city": "Belo Horizonte",
        "country": "Brazil",
        "county": "Sao Bento",
        "state": "Minas Gerais",
        "street": "Alameda dos Anjos",
        "unit": "102",
        "zipCode": "94103345"
      }
    }
  },
  "proof": {
    "type": "CivicMerkleProof2018",
    "merkleRoot": "c81c5b22438916f2bd75e2966df989b9302ce65887813dd1661f9f24407c5dfe",
    "anchor": {
      "subject": {
        "pub": "xpub:dummy",
        "label": "cvc:Credential:Address",
        "data": "c81c5b22438916f2bd75e2966df989b9302ce65887813dd1661f9f24407c5dfe",
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
        "identifier": "cvc:Identity:address",
        "value": "urn:city:508e6c84091b405587f755eb5e0d9dbd15f4f7f69642adc18d2d2d8fe9c93366:Belo Horizonte|urn:country:f53c0e02620611705f5dfab2abe8320679f183f7eaa01b50340b6f0f0579638f:Brazil|urn:county:a9d100b24769843e15d8fff52efc5d15f57150e1c252d99c0ea7f8d6ed740e4a:Sao Bento|urn:state:73d0477e24c5b3498addf6877c52ae5916b7cf9fbcaea2e2d440167e4745fab2:Minas Gerais|urn:street:71cb22a895ee6264ed2f0cc851a9e17c5326f70bfd94e945e319d03f361d47d9:Alameda dos Anjos|urn:unit:887eb71750da1837101eb64c821f0a0a58e7ab3254eeed1b6bf2cec72b7a4174:102|urn:zipCode:dc671959502dfa65de57a0a8176da15437493c37497670445268e286a035bea8:94103345|",
        "claimPath": "type.address",
        "targetHash": "c1b096d40d2ac94c095ebea67af8d2ffb6788a9d0367ffef0010e0c40dd5157d",
        "node": [
          {
            "right": "f97fe9f193a485120e2eef5ee57132b05d7b9c02c53fcf7617663d99b9b6d482"
          },
          {
            "right": "e0dbcf542838280f07d49c2b7c9a4bf9e681b43fc6a55ff7db1973d17b44c37c"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuer",
        "value": "urn:issuer:a68ed1b5f92ee8ce1e142b232dcb4ca0e2733f51f9893383e6adc3c53887e2fd:did:ethr:0x1ddcbae835c47c8d9159756c167994931a5f01e8",
        "claimPath": "meta.issuer",
        "targetHash": "f97fe9f193a485120e2eef5ee57132b05d7b9c02c53fcf7617663d99b9b6d482",
        "node": [
          {
            "left": "c1b096d40d2ac94c095ebea67af8d2ffb6788a9d0367ffef0010e0c40dd5157d"
          },
          {
            "right": "e0dbcf542838280f07d49c2b7c9a4bf9e681b43fc6a55ff7db1973d17b44c37c"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuanceDate",
        "value": "urn:issuanceDate:c3b9798fe98020b041b4bd20027eee5c2895ff47b3fb0c5a4e8d1d061ae2733d:2018-09-25T21:51:56.511Z",
        "claimPath": "meta.issuanceDate",
        "targetHash": "d3706f4891c1fbfcfa208e7b662858460a992bc547141ee69f7c778681eeab08",
        "node": [
          {
            "right": "5bb75bfee07b5ed5ead3d96ae21d420ce3f8419c8b2ca287eca358507f834312"
          },
          {
            "left": "9dbba3ce114413f76478581417768af3d2f2e6517513c5257b6c5313824f6e68"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:expirationDate",
        "value": "urn:expirationDate:7388ed27d10476f47cd9c68a732a9b9eccfd44598cdcb2f785f5131c33991f5b:+132017-07-11T05:51:56.512Z",
        "claimPath": "meta.expirationDate",
        "targetHash": "5bb75bfee07b5ed5ead3d96ae21d420ce3f8419c8b2ca287eca358507f834312",
        "node": [
          {
            "left": "d3706f4891c1fbfcfa208e7b662858460a992bc547141ee69f7c778681eeab08"
          },
          {
            "left": "9dbba3ce114413f76478581417768af3d2f2e6517513c5257b6c5313824f6e68"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      }
    ]
  }
}

```

### Credentials

A Credential with an associated Proof. Every consumer of a verifiable Credentials must be able to verify those independently. Holders of Credentials (aka Mobile Phones) are creating "Verifiable Credentials" for Inspectors (aka Requesters).

#### Defining new UCA

Just add a new definition entry with the [format](http://) on the definitions [file](http://)

#### Exporting UCA to the UCA Registry Services

Credentials definitions are packed inside this library but also are available for public consumption at the [Credential Registry](http://) to export new defined Credentials
 
```
npm run export-definitions 
``` 

#### Using a VerifiableCredential in javascript (with this library)

##### creating VerifiableCredential instances with the constructor

To construct a new VC you need first to get instances of all UCA dependencies
```
const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
const cred = new VC('cvc:cred:Test', 'jest:test', [name, dob]);
```

##### anchoring VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all UCA dependencies
```
const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
const cred = new VC('cvc:cred:Test', 'jest:test', [name, dob]);
cred.requestAnchor().then(() => {
  //The original instance is updated
})
```

##### refreshing an anchor (temp => permanent) VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all UCA dependencies
```
const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
const cred = new VC('cvc:cred:Test', 'jest:test', [name, dob]);
cred.updateAnchor().then(() => {
  //The original instance is updated
})
```

##### Verifiable Credential Sample
```
{
  "id": null,
  "issuer": "did:ethr:0x1ddcbae835c47c8d9159756c167994931a5f01e8",
  "issuanceDate": "2018-09-25T21:51:56.511Z",
  "identifier": "cvc:Credential:Address",
  "expirationDate": "+132017-07-11T05:51:56.512Z",
  "version": "1",
  "type": [
    "Credential",
    "cvc:Credential:Address"
  ],
  "claim": {
    "type": {
      "address": {
        "city": "Belo Horizonte",
        "country": "Brazil",
        "county": "Sao Bento",
        "state": "Minas Gerais",
        "street": "Alameda dos Anjos",
        "unit": "102",
        "zipCode": "94103345"
      }
    }
  },
  "proof": {
    "type": "CivicMerkleProof2018",
    "merkleRoot": "c81c5b22438916f2bd75e2966df989b9302ce65887813dd1661f9f24407c5dfe",
    "anchor": {
      "subject": {
        "pub": "xpub:dummy",
        "label": "cvc:Credential:Address",
        "data": "c81c5b22438916f2bd75e2966df989b9302ce65887813dd1661f9f24407c5dfe",
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
        "identifier": "cvc:Identity:address",
        "value": "urn:city:508e6c84091b405587f755eb5e0d9dbd15f4f7f69642adc18d2d2d8fe9c93366:Belo Horizonte|urn:country:f53c0e02620611705f5dfab2abe8320679f183f7eaa01b50340b6f0f0579638f:Brazil|urn:county:a9d100b24769843e15d8fff52efc5d15f57150e1c252d99c0ea7f8d6ed740e4a:Sao Bento|urn:state:73d0477e24c5b3498addf6877c52ae5916b7cf9fbcaea2e2d440167e4745fab2:Minas Gerais|urn:street:71cb22a895ee6264ed2f0cc851a9e17c5326f70bfd94e945e319d03f361d47d9:Alameda dos Anjos|urn:unit:887eb71750da1837101eb64c821f0a0a58e7ab3254eeed1b6bf2cec72b7a4174:102|urn:zipCode:dc671959502dfa65de57a0a8176da15437493c37497670445268e286a035bea8:94103345|",
        "claimPath": "type.address",
        "targetHash": "c1b096d40d2ac94c095ebea67af8d2ffb6788a9d0367ffef0010e0c40dd5157d",
        "node": [
          {
            "right": "f97fe9f193a485120e2eef5ee57132b05d7b9c02c53fcf7617663d99b9b6d482"
          },
          {
            "right": "e0dbcf542838280f07d49c2b7c9a4bf9e681b43fc6a55ff7db1973d17b44c37c"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuer",
        "value": "urn:issuer:a68ed1b5f92ee8ce1e142b232dcb4ca0e2733f51f9893383e6adc3c53887e2fd:did:ethr:0x1ddcbae835c47c8d9159756c167994931a5f01e8",
        "claimPath": "meta.issuer",
        "targetHash": "f97fe9f193a485120e2eef5ee57132b05d7b9c02c53fcf7617663d99b9b6d482",
        "node": [
          {
            "left": "c1b096d40d2ac94c095ebea67af8d2ffb6788a9d0367ffef0010e0c40dd5157d"
          },
          {
            "right": "e0dbcf542838280f07d49c2b7c9a4bf9e681b43fc6a55ff7db1973d17b44c37c"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:issuanceDate",
        "value": "urn:issuanceDate:c3b9798fe98020b041b4bd20027eee5c2895ff47b3fb0c5a4e8d1d061ae2733d:2018-09-25T21:51:56.511Z",
        "claimPath": "meta.issuanceDate",
        "targetHash": "d3706f4891c1fbfcfa208e7b662858460a992bc547141ee69f7c778681eeab08",
        "node": [
          {
            "right": "5bb75bfee07b5ed5ead3d96ae21d420ce3f8419c8b2ca287eca358507f834312"
          },
          {
            "left": "9dbba3ce114413f76478581417768af3d2f2e6517513c5257b6c5313824f6e68"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      },
      {
        "identifier": "cvc:Meta:expirationDate",
        "value": "urn:expirationDate:7388ed27d10476f47cd9c68a732a9b9eccfd44598cdcb2f785f5131c33991f5b:+132017-07-11T05:51:56.512Z",
        "claimPath": "meta.expirationDate",
        "targetHash": "5bb75bfee07b5ed5ead3d96ae21d420ce3f8419c8b2ca287eca358507f834312",
        "node": [
          {
            "left": "d3706f4891c1fbfcfa208e7b662858460a992bc547141ee69f7c778681eeab08"
          },
          {
            "left": "9dbba3ce114413f76478581417768af3d2f2e6517513c5257b6c5313824f6e68"
          },
          {
            "right": "207f569aa16908c29cd1bf590f5e3745d6a433119cf31f024e8c1cbb680d4e41"
          },
          {
            "right": "9a09e4b79ec54507896892ac23d8b5d707786b075ead58a69d51c4376805e9c1"
          }
        ]
      }
    ]
  }
}
```

##### Construting a VerifiableCredential from a JSON
To construct a new VC given a JSON, just use the `.fromJSON` method:
```
const credJSon = require('./ACred.json');
const cred = VC.fromJSON(credJSon);
```
Now you can access any method of a `cred` instance, like `.updateAnchor()` or `.verify()`

##### Verifying a Verifiable Credential

Remember to check the section about configuration or else this part will fail.

To verify a credential JSON, you can construct a VC using `.fromJSON` and call `.verify()` method:
```
const credJSon = require('./ACred.json');
const cred = VC.fromJSON(credJSon);
const verifiedLevel = cred.verify();
```
The `.verify()` method return the hiest level verified, follow the `VC.VERIFY_LEVELS` constant:
```
VERIFY_LEVELS = {
  INVALID: -1, // Credential structure and/or signature proofs is not valid, or credential is expired
  PROOFS: 0, // Credential structure and/or signature proofs are valid, including the expiry
  ANCHOR: 1, // Anchor struture is valid
  BLOCKCHAIN: 2, // Attestation was validated on blockchain
};
```

## Schema Generator

The json schema generator will get a previous definition and build a sample JSON (with random values).

On top of the sample data and combining the identifier properties it will infer an JSON Schema for validating the data.

A identifier like this:

Example
```javascript
const name = new UCA('cvc:Identity:name', {
  first: 'Joao', 
  middle: 'Barbosa', 
  last: 'Santos'
})
```

Will generate a JSON like this:


```
{
  first: 'Joao', 
  middle: 'Barbosa', 
  last: 'Santos'
}
```

The schema generator will generate an json schema like this:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "cvc:Identity:name.first",
  "type": "object",
  "properties": {
    "first": {
      "type": "string"
    }
  },
  "required": [
    "first"
  ],
  "additionalProperties": false
}
```

## Conventions:

-We use draft 7 for json schema generation

-Values that can have null, must have `type : ['null','string']` or else they fail validation if you only send null or if you send an value

-All simple objects String, Number are required as default

-Accepted json schema keywords on identifiers: pattern, maximum, minimum, exclusiveMinimum, exclusiveMaximum, required

-If an identifier has a pattern it must be an Javascript Regex, the generated value will generate the random value using this

-Additional properties are not enabled by default

## ES5 and ES6 definitions

The project structure is made like this:

```
|_ __tests__
|_ __integration__
|_ src
|_ dist
|__ cjs
|__ es
|__ browser
|_ reports
|__ coverage
```

* Tests and Integration folder contains jest tests
* src contains all ES6 non-transpiled source
* dist contains all transpiled code in CJS, ES, BROWSER presets of Babel
* also the package.json has the three fields main, module, browser, that allow packers to change the file of the entry point
* reports and coverage are all related to JEST tests

The released browser version is minified.

The main entry point targets CJS, all legacy code should work with this.

Sip-hosted-api is tested with this and it works right out of the box, without any other configuration.

Browser projects should bundle the dependencies, so we are not bundling it here.

The browser transpiled version only guarantees the profile we want to target and not leave this task to the user, since any other different transpilation, could result in bugs.

But as pointed out before, if the target project is ES6 compliant, the pkg.module will point out to the ES version.

## Node vs React usage of this library

Put this in your webpack config under plugins if you are running an Webpack Node App
```js
new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: 'production',
        APP_ENV: false
    }
})
```

If you are on a React app add this:

```js
new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: false,
        APP_ENV: 'browser'
    }
})
```

With that you can check if you're running in a browser or not this way:

```js

if (process.env.APP_ENV === 'browser') {
    const doSomething = require('./browser-only-js');
    doSomething();
} else {
    const somethingServer = require('./server-only-js');
    somethingServer();
}

if (process.env.APP_ENV !== 'browser') {
    const somethingServer = require('./server-only-js');
    somethingServer();
}
```

Because these environment variables get replaced during the build, Webpack will not include resources that are server-only. You should always do these kinds of things in an easy way, with a simple, direct compare. Uglify will remove all dead code.

Since you used a function before and the function is not evaluated during build, Webpack wasn't able to know what requires it could skip.

(The NODE_ENV-variable should always be set to production in production mode, since many libraries including React use it for optimisations.)

This is used on this library on src/services/config.js

## Releases

The release process is fully automated and started by Civic members when it's created a tag on Github following the pattern vX.X.X-rcX. E.g.: v0.2.29-rc1.

After the creation of the tag, Circle Ci will trigger a job to:

build source files
run unit tests
increase version number on package.json
create the stable version tag dropping the 'rc' suffix. E.g: v0.2.29
deploy the binary file to NPM
