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
* Attestable Values: `{attestableValue: 's:0902b1abf8b30dbf03c79d144d24f44055637eefa84f2ca024d1d2d9a39f30c5:Joao|s:ee9c6b4e76224bc3f56ed3f4bd2f9037f3665b546abdc49e0a59fcb25b771c14:Santos|s:c1dfa74b335f81a19914c3b8aa98ce25a30371836d740579edc69ceec5f597c6:Barbosa|'}`

JSON String
 
```
{JSON: "
{
      "timestamp": 1527706184.575,
      "id": "1:civ:Identity:name:817c71d0eb9db9a583143c1d92becf765945d62982f26998e9249850e8ad41bf",
      "identifier": "civ:Identity:name",
      "version": "1",
      "type": "Object",
      "value": {
        "first": {
          "timestamp": 1527706184.575,
          "id": "1:civ:Identity:name.first:c88b3d4d5b937b8c72908b7537b0bc42826d1d296392e90e58ac0b55c71dab31",
          "identifier": "civ:Identity:name.first",
          "version": "1",
          "type": "String",
          "value": "Joao",
          "salt": "397b809df57fb5046229cf85b814336099a641a0081cfd36032a4425f6aa215f"
        },
        "middle": {
          "timestamp": 1527706184.575,
          "id": "1:civ:Identity:name.middle:4732d8a87c36939a0065998c7765a8420a766bf8df613994e5f521d37447599b",
          "identifier": "civ:Identity:name.middle",
          "version": "1",
          "type": "String",
          "value": "Barbosa",
          "salt": "047fc2a71a738e8121a7544a656cf8e90af8278d919aa98e878fcaf76db892ef"
        },
        "last": {
          "timestamp": 1527706184.575,
          "id": "1:civ:Identity:name.last:8071573fd1af791f3a29107c2ed90125ee74e71aadef4afea6f08045cada7201",
          "identifier": "civ:Identity:name.last",
          "version": "1",
          "type": "String",
          "value": "Santos",
          "salt": "c9c018f795f676c86e24641f41c8a9bd270f1d878e5d90dd6b5fe63744bcca6d"
        }
      }
    }
"}
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


[npm]: https://img.shields.io/badge/npm-5.3.0-blue.svg
[npm-url]: https://npmjs.com/

[node]: https://img.shields.io/node/v/webpack-es6-boilerplate.svg
[node-url]: https://nodejs.org

[tests]: http://img.shields.io/travis/jluccisano/webpack-es6-boilerplate.svg
[tests-url]: 

[cover]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate

