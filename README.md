# Verifiable Credential and Attestation Library

[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]

Verifiable Credential and Attestation Library - CCS-38

## Contents

- [Verifiable Credential and Attestation Library](#verifiable-credential-and-attestation-library)
  * [Contents](#contents)
  * [Prerequisites](#prerequisites)
  * [Features](#features)
    + [User Collectable Attributes](#user-collectable-attributes)
      - [Defining new UCA](#defining-new-uca)
      - [Exporting UCA to the UCA Registry Services](#exporting-uca-to-the-uca-registry-services)
      - [Using a UCA in javascript (with this library)](#using-a-uca-in-javascript--with-this-library-)
        * [creating UCA instances with the constructor](#creating-uca-instances-with-the-constructor)
    + [Credentials](#credentials)
      - [Defining new UCA](#defining-new-uca-1)
      - [Exporting UCA to the UCA Registry Services](#exporting-uca-to-the-uca-registry-services-1)
      - [Using a VerifiableCredential in javascript (with this library)](#using-a-verifiablecredential-in-javascript--with-this-library-)
        * [creating VerifiableCredential instances with the constructor](#creating-verifiablecredential-instances-with-the-constructor)
          + [Verifiable Credential Sample](#verifiable-credential-sample)
        * [Construting a VerifiableCredential from a JSON](#construting-a-verifiablecredential-from-a-json)
        * [Verifying a Verifiable Credential](#verifying-a-verifiable-credential)
  * [Schema Generator](#schema-generator)
  * [Conventions:](#conventions-)
  * [Commands](#commands)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

## Prerequisites

[![node][node]][node-url]
[![npm][npm]][npm-url]
      
- [Node.js](http://es6-features.org)

## Configuration

This library depends on some configuration settings to work properly.
The configuration is made in three different ways that override each other: 
* etc config file
* user config file
* environment's variables, in code (not recommended as you can push that to your repo)

and consists of the following settings:

* CIVIC_SEC_URL - Base endpoint address to the Civic Security Service, where you can register this lib as a client
* CIVIC_ATTN_URL - Base endpoint address to the Civic Attestation Service
* CIVIC_CLIENT_ID - The ID of this lib installation
* CIVIC_CLIENT_XPUB - The public key used by this installation
* CIVIC_CLIENT_XPRIV - The public key used by this installation
* CIVIC_PASSPHASE - Civic User Wallet Passphrase. prefer setting this in code
* CIVIC_KEYCHAIN - Civic User Wallet KEYCHAIN. prefer setting this in code
 

### Etc Config File /etc/civic/config
### User Config File ~/.civic/config

### incode
```
const CCC = require('civic-credentials-commons');
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
const name = new UCA('civ:Identity:name', {
	first: 'Joao', 
    middle: 'Barbosa', 
    last: 'Santos'
}, '1')
```
Or use the shorthand
```
const name = new UCA.IdentityName({
	first: 'Joao', 
    middle: 'Barbosa', 
    last: 'Santos'
}, '1')
```

**values** can be:
*  Plain JavaScript Objects:
`{
	first: 'Joao', 
    middle: 'Barbosa', 
    last: 'Santos'
}`
* Attestable Values: 
```json
{
  "attestableValue": "urn:first:0902b1abf8b30dbf03c79d144d24f44055637eefa84f2ca024d1d2d9a39f30c5:Joao|s:ee9c6b4e76224bc3f56ed3f4bd2f9037f3665b546abdc49e0a59fcb25b771c14:Santos|urn:middle:c1dfa74b335f81a19914c3b8aa98ce25a30371836d740579edc69ceec5f597c6:Barbosa|"
}
```

JSON String
 
```json

{
  "id": null,
  "issuer": "jest:test",
  "issued": "2018-06-26T23:31:52.228Z",
  "identifier": "civ:Credential:SimpleTest",
  "expiry": null,
  "version": 1,
  "type": [
    "Credential",
    "civ:Credential:SimpleTest"
  ],
  "claims": {
    "identity": {
      "name": {
        "first": "Joao",
        "last": "Santos",
        "middle": "Barbosa"
      },
      "dateOfBirth": {
        "day": 20,
        "month": 3,
        "year": 1978
      }
    }
  },
  "signature": {
    "type": "CivicMerkleProof2018",
    "merkleRoot": "ccafdcd832e387447cf26a47f0865be38e23d5903689e17c865027e1cdaf6d2d",
    "anchor": "TBD (Civic Blockchain Attestation)",
    "leaves": [
      {
        "identifier": "civ:Identity:name",
        "value": "urn:first:f22eb39e63dde54d6ba22f090118459de3f015a5ac221c7b2ddbd189362e53a2:Joao|urn:last:358c5aa0aff20bf4f5efc5cf1d8b5f07e06545e1afbd121a1e909b3947b73085:Santos|urn:middle:de4fa49d9708c4a1b7d14d96076cbdc9c2c2a4a959ef2723b3466acc5befdb1b:Barbosa|",
        "claimPath": "identity.name",
        "targetHash": "0135f11c7ac0d424a8565dabe87bfc7702a29ca82b66551105892ad156f26304",
        "proof": [
          {
            "right": "4adb4b12312cfab30e766f9e1846eb84308368c0d8e74680a56a6f3534171b1f"
          },
          {
            "right": "d72b46aa23e300a8f55b56d424576e3284ca6121ecba69318c56ae8ed344fdcd"
          },
          {
            "right": "de9db4b23cb9981d7ae49d69670a7bacb2682deebd7804ed2d280d0d89d2a693"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.first",
        "value": "urn:first:f22eb39e63dde54d6ba22f090118459de3f015a5ac221c7b2ddbd189362e53a2:Joao",
        "claimPath": "identity.name.first",
        "targetHash": "4adb4b12312cfab30e766f9e1846eb84308368c0d8e74680a56a6f3534171b1f",
        "proof": [
          {
            "left": "0135f11c7ac0d424a8565dabe87bfc7702a29ca82b66551105892ad156f26304"
          },
          {
            "right": "d72b46aa23e300a8f55b56d424576e3284ca6121ecba69318c56ae8ed344fdcd"
          },
          {
            "right": "de9db4b23cb9981d7ae49d69670a7bacb2682deebd7804ed2d280d0d89d2a693"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.middle",
        "value": "urn:middle:de4fa49d9708c4a1b7d14d96076cbdc9c2c2a4a959ef2723b3466acc5befdb1b:Barbosa",
        "claimPath": "identity.name.middle",
        "targetHash": "e07ae9a487593942f776d68ad2734da0bd86c33c6fb224ffb47ac4a11cd50249",
        "proof": [
          {
            "right": "49714c326e6c330e66800f74454b6aa5a4925dc3f6223d97a95eeb79721291f8"
          },
          {
            "left": "76b998980de49201b916b9c64197e6108c3d67050a305c9af935118754282cb2"
          },
          {
            "right": "de9db4b23cb9981d7ae49d69670a7bacb2682deebd7804ed2d280d0d89d2a693"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.last",
        "value": "urn:last:358c5aa0aff20bf4f5efc5cf1d8b5f07e06545e1afbd121a1e909b3947b73085:Santos",
        "claimPath": "identity.name.last",
        "targetHash": "49714c326e6c330e66800f74454b6aa5a4925dc3f6223d97a95eeb79721291f8",
        "proof": [
          {
            "left": "e07ae9a487593942f776d68ad2734da0bd86c33c6fb224ffb47ac4a11cd50249"
          },
          {
            "left": "76b998980de49201b916b9c64197e6108c3d67050a305c9af935118754282cb2"
          },
          {
            "right": "de9db4b23cb9981d7ae49d69670a7bacb2682deebd7804ed2d280d0d89d2a693"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Identity:dateOfBirth",
        "value": "urn:day:fdc8f529d261eb57c0506de83fcc6265d4c68edb3fcf1d9fda19fcb429a4e6f9:00000020|urn:month:0a1ad6def5a3b7fbab777be6e72e324f038d1eacf5cf7b48f82145ff3d02b083:00000003|urn:year:4e1da169cd7a410c3631eeb7bee0e04907b36c19cc1999d0056e81d1a9dc1838:00001978|",
        "claimPath": "identity.dateOfBirth",
        "targetHash": "7c29203647db461bb7ab23b1a70c24592c1f6d58401fda3d98c829b75ede670c",
        "proof": [
          {
            "right": "c8e8675e62389441b1795dec7c8e890ec89c2afbeb2fd2d0ff54e800fcaedc03"
          },
          {
            "right": "1f07de4ee4288c0f8b7ec0343684bc653f26821cf2504b0c46db474073633bd8"
          },
          {
            "left": "1b0870d7fb651b15af8da3408e74aab06773cbf1101d2842ca08a8694169a9be"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Meta:issuer",
        "value": "urn:issuer:21eb0ecc12cece7d26701243104227c8dda0effa0a4a511d26b9137018547fc5:jest:test",
        "claimPath": "meta.issuer",
        "targetHash": "c8e8675e62389441b1795dec7c8e890ec89c2afbeb2fd2d0ff54e800fcaedc03",
        "proof": [
          {
            "left": "7c29203647db461bb7ab23b1a70c24592c1f6d58401fda3d98c829b75ede670c"
          },
          {
            "right": "1f07de4ee4288c0f8b7ec0343684bc653f26821cf2504b0c46db474073633bd8"
          },
          {
            "left": "1b0870d7fb651b15af8da3408e74aab06773cbf1101d2842ca08a8694169a9be"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
          }
        ]
      },
      {
        "identifier": "civ:Meta:issued",
        "value": "urn:issued:448d49c769c2a47b920ef144b643f38d532cceb2997050cf62291f3f5df8c34c:2018-06-26T23:31:52.228Z",
        "claimPath": "meta.issued",
        "targetHash": "94fc31dbf55e91171f686547299d44490bbbecdd25fba2c56f3b1df1b528089f",
        "proof": [
          {
            "right": "826ddf38bb962ba95eef95b7cb90aebc41c43b2ea014e17b9fea101a028dd5ba"
          },
          {
            "left": "4c416305d4144675a4ee938b50a4b4fe664d0474e6fbfe1faf5111bd01bd0267"
          },
          {
            "left": "1b0870d7fb651b15af8da3408e74aab06773cbf1101d2842ca08a8694169a9be"
          },
          {
            "right": "e89b0becae54e035d61a90ddaeb0a2d61fd799105ceeaa21aba09c9fd347845b"
          },
          {
            "right": "7ef47952ec4daba58f149356ec10c1120d3d6e051f1105414befc02881898071"
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
const cred = new VC('civ:cred:Test', 'jest:test', [name, dob]);
```

##### anchoring VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all UCA dependencies
```
const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
const cred = new VC('civ:cred:Test', 'jest:test', [name, dob]);
cred.requestAnchor().then(() => {
  //The original instance is updated
})
```

##### refreshing an anchor (temp => permanent) VerifiableCredential instances with the constructor
To construct a new VC you need first to get instances of all UCA dependencies
```
const name = new UCA.IdentityName({ first: 'Joao', middle: 'Barbosa', last: 'Santos' });
const dob = new UCA.IdentityDateOfBirth({ day: 20, month: 3, year: 1978 });
const cred = new VC('civ:cred:Test', 'jest:test', [name, dob]);
cred.updateAnchor().then(() => {
  //The original instance is updated
})
```

##### Verifiable Credential Sample
```
    {
      "id": null,
      "issuer": "jest:test",
      "issued": "2018-05-30T19:01:22.880Z",
      "version": "1",
      "type": [
        "Credential",
        "civ:cred:Test"
      ],
      "claims": {
        "identity": {
          "name": {
            "first": "Joao",
            "last": "Santos"
          },
          "DateOfBirth": {
            "day": 20,
            "month": 3,
            "year": 1978
          }
        }
      },
      "signature": {
        "type": "CivicMerkleProof2018",
        "merkleRoot": "39dac9c79965f33f5f3f0738636d50937f70a7da32a810f23a876f1e7c94c3d7",
        "anchor": "TBD (Civic Blockchain Attestation)",
        "leaves": [
          {
            "identifier": "civ:Identity:name",
            "value": "s:a8df73a9028603921bdb9167acc63e6e5c60a582e11283f81ce8f355a39d9617:Joao|s:e6a29e876ba248125026fb31846bbed7da7db51e2c861b0d4f1a317dce09930b:Santos|s:0e2b187cb38ac012b03d3a675ab5e37702e1e3fd12ac4f205e61fc6f2f641b49:Barbosa|",
            "claimPath": "identity.name",
            "targetHash": "418743983be14b74faf11499d7790e365ced5bd7ead8b2d8f381567f53959831",
            "proof": [
              {
                "right": "c7717cfdbd2d2a199c79760d17c2aa8f549dda0285a71a53c17fab04bdf531ff"
              },
              {
                "right": "5757a28c2a7a5311be7bd465887ab2195b7238c31e167d47c01d11a11bba55f4"
              },
              {
                "right": "173760a0c0c0f1e5312855b5607649c7fc1246a6a22a8d9b54e88487747b021c"
              },
              {
                "right": "71a40449b98a95c458b775362c3152878f57428c92b0ff20e8768d2138f9d8fe"
              },
              {
                "right": "e8c1cafa1f20c862c739d26216539738cff23b57947954b757461dc14a689559"
              }
            ]
          },
          {
            "identifier": "civ:Identity:name.first",
            "value": "s:a8df73a9028603921bdb9167acc63e6e5c60a582e11283f81ce8f355a39d9617:Joao",
            "claimPath": "identity.name.first",
            "targetHash": "c7717cfdbd2d2a199c79760d17c2aa8f549dda0285a71a53c17fab04bdf531ff",
            "proof": [
              {
                "left": "418743983be14b74faf11499d7790e365ced5bd7ead8b2d8f381567f53959831"
              },
              {
                "right": "5757a28c2a7a5311be7bd465887ab2195b7238c31e167d47c01d11a11bba55f4"
              },
              {
                "right": "173760a0c0c0f1e5312855b5607649c7fc1246a6a22a8d9b54e88487747b021c"
              },
              {
                "right": "71a40449b98a95c458b775362c3152878f57428c92b0ff20e8768d2138f9d8fe"
              },
              {
                "right": "e8c1cafa1f20c862c739d26216539738cff23b57947954b757461dc14a689559"
              }
            ]
          },
          {
            "identifier": "civ:Identity:name.last",
            "value": "s:e6a29e876ba248125026fb31846bbed7da7db51e2c861b0d4f1a317dce09930b:Santos",
            "claimPath": "identity.name.last",
            "targetHash": "cc19edeed421621c97eb01f4eb344c5bcd9d0346ca6a36d257d9e5200fff2b51",
            "proof": [
              {
                "left": "d736ca29cb6f9933dd7040fc035277e94ea39b53577a28a6c5cee5b0b1b7202f"
              },
              {
                "left": "d7a66659bcbb9ee67b025db8342cc20441c9ad58cc4b2c052f8c8f0146a5cf84"
              },
              {
                "right": "173760a0c0c0f1e5312855b5607649c7fc1246a6a22a8d9b54e88487747b021c"
              },
              {
                "right": "71a40449b98a95c458b775362c3152878f57428c92b0ff20e8768d2138f9d8fe"
              },
              {
                "right": "e8c1cafa1f20c862c739d26216539738cff23b57947954b757461dc14a689559"
              }
            ]
          },
          {
            "identifier": "civ:Identity:DateOfBirth",
            "value": "n:94db726e00e43767c969c1e23ce3fd6f0fccdaedd3e49154d56fa0d436f6f935:00000020|n:6a5ae6282cf1c6c363cfb6ac4eeac972581c7e2757e4948d4e63d394839991fe:00000003|n:4f8631638e8685998e17e220d30489b7b12a5197a26b4f6885a5371346fde211:00001978|",
            "claimPath": "identity.DateOfBirth",
            "targetHash": "d976377fca90fc98aed048bda3a2796750a1b4c96fb04e052c90dd9434ae0196",
            "proof": [
              {
                "right": "52d0e0f1dee556f456ba149bfde2c7b07c40070dcf18a82ee5e750d3b15f32a9"
              },
              {
                "right": "4fda24814d65e12aceb1e63240785eedcad1332da75b404b166be2dff9144c18"
              },
              {
                "left": "cbfd7b92424edd878956b97637549bdaba39b4d469294d96e13d0ae6e7c0b594"
              },
              {
                "right": "71a40449b98a95c458b775362c3152878f57428c92b0ff20e8768d2138f9d8fe"
              },
              {
                "right": "e8c1cafa1f20c862c739d26216539738cff23b57947954b757461dc14a689559"
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

The json schema generator will get an previous definition and build a sample JSON (with random values).

On top of the sample data and combining the identifier properties it will infer an JSON Schema for validating the data.

A identifier like this:

Example
```javascript
const name = new UCA('civ:Identity:name', {
	first: 'Joao', 
    middle: 'Barbosa', 
    last: 'Santos'
}, '1')
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
  "title": "civ:Identity:name.first",
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

## Commands

- `npm run lint` - run an ESLint check
- `npm run coverage` - run code coverage and generate report in the `coverage` folder
- `npm test` - run all tests
- `npm run test:watch` - run all tests in watch mode
- `npm run generate-schema` - run the CLI command and generate all schemas


## Integration with CCS Libraries 
CCS Libraries can be integrated with projects by pointing out on package.json to the latest repo.

For now all libraries are released only on GitHub tags.

For Civic Developers on Node 8 or superior add this dependency to package.json

"civic-credentials-common-js": "github:civicteam/civic-credentials-commons-js"

This will install the latest version of the default branch on github (currently that branch is develop, but as soon as we release to production it should change to master).

You can also add via npm install with the command:

```bash npm install civicteam/civic-credentials-commons-js```

When the project is released to NPM Release the command will be only:

```bash npm install civic-credentials-commons-js```

The following question may arise, why the civic name on the project?

Modules are lower case and usually dash-separated. If your module is a pure utility, you should generally favor clear and "boring" names for better discoverability and code clarity.

This library is not pure utility and has a lot of Civic only patterns, so using the civic-* pattern becomes useful as it won't have any name clash with other packages and also makes it clear, that it's not a pure utility for other projects to use.

For future projects that we release on public, if it's a pure utility, the prefix civic-* should not be used.

Using specific tags on projects configuration
On the project that is going to use the library, configure on the package.json as the following example:

```json

"civic-credentials-commons-js": "civicteam/civic-credentials-commons-js.git#vX.Y.Z",

```

This will get the specific version tagged on github.

All versions here follow SemVer (https://semver.org/)
Don't forget to add the version on your package.json, or else it will always get the latest from GitHub default branch.

## ES5 and ES6 definitions

The project structure is made like this:

|_ __tests__
|_ __integration__
|_ src
|_ dist
|__ cjs
|__ es
|__ browser
|_ reports
|__ coverage

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

For now the default branch is "develop" as this is an WIP library.

Releases will only be triggered from successfully tested "master" branches once we go live.

The pattern should be to add to the circleci workflow.

All releases are tagged on github and won't follow lodash pattern, that release a tag and source for each transpilation.

[npm]: https://img.shields.io/badge/npm-5.3.0-blue.svg
[npm-url]: https://npmjs.com/

[node]: https://img.shields.io/node/v/webpack-es6-boilerplate.svg
[node-url]: https://nodejs.org

[tests]: http://img.shields.io/travis/jluccisano/webpack-es6-boilerplate.svg
[tests-url]: 

[cover]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate

