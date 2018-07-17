# Verifiable Credential and Attestation Library

[![CircleCI](https://circleci.com/gh/civicteam/civic-credentials-commons-js.svg?style=svg&circle-token=d989196488010043c3dbd96d70864614ce3e6eba)](https://circleci.com/gh/civicteam/civic-credentials-commons-js)

## Contents

- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
  * [Etc Config File /etc/civic/config](#etc-config-file--etc-civic-config)
  * [User Config File ~/.civic/config](#user-config-file---civic-config)
  * [incode](#incode)
    + [Prepare Bitgo Wallet](#prepare-bitgo-wallet)
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
* CLIENT_WALLET_ID - For revocation and verification functions, the BitGo Wallet ID (not the address)
* CLIENT_WALLET_PASSPHRASE - For revocation and verification functions, the BitGo Wallet ID (not the xprv nor the use key card pdf, store that safely!)
* CLIENT_ACCESS_TOKEN - BitGo access token to access wallets, must have the Admin property to the target wallet that will make spending
 
There is an utility on cli folder, the configuration.js, just run it:

```bash
node cli/configuration.js
```

And it will store the file like below:

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

If you are not sure how to get those informations, see the tutorial down below.

#### Prepare Bitgo Wallet
a. Create a wallet with Bitgo - record the following information as you need them later:

**Wallet ID:** <obtained from the Bitgo URL: https://test.bitgo.com/enterprise/5aabb27e8a0a3c9c07fc7db49017fc7f/coin/tbch/*5aabb2aced2e259a079259b01c05d21a*/transactions >

**Wallet passphrase:** < set when creating the wallet - this may be different to your account passcode for bitgo>

**Wallet XPrv:** < You receive this in encrypted form in the PDF - section 1. User Key>

**Enterprise ID:** < obtained from the Bitgo URL: https://test.bitgo.com/enterprise/*5aabb27e8a0a3c9c07fc7db49017fc7f*/coin/tbch/5aabb2aced2e259a079259b01c05d21a/transactions >

b. Decrypt the XPrv

```
git clone git@github.com:masonicGIT/sjcl-cli.git
cd sjcl-cli
node src/index
```

Enter encrypted data: <enter the User Key from the PDF **without newlines**>

Enter passcode: <your BitGo account password (see above)>

c. Generate an access token

Via the BitGO Website User Settings -> Developer Options
* Ensure you add a high spending limit for BCH


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
```json
{
	"first": 'Joao', 
    "middle": 'Barbosa', 
    "last": 'Santos'
}
```
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
  "issued": "2018-07-04T00:11:55.698Z",
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
    "merkleRoot": "14613d43860ea919e6bbcff2405fdd59685ab1295048c301448cb4f68b0ea51f",
    "anchor": {
      "subject": {
        "pub": "xpub661MyMwAqRbcFNXRK7kdsoidhiyfqiwhVhbphdKZjqnik83L1w1mWsPwVrsvbRrPa7sysiJRRBxr6jyrCbPScdXkhSjyYtQtFfwxGBwrBzn",
        "label": "civ:Credential:SimpleTest",
        "data": "14613d43860ea919e6bbcff2405fdd59685ab1295048c301448cb4f68b0ea51f",
        "signature": "30440220112d63de4802353002ae4bde013293b3e7afe3c60ecf6eaf27de733862a06a65022048d38e58112193ea27c7758cad6d984742ed4d48f7f5b16bdb49322c0a797d36"
      },
      "walletId": "5b3c10ddf9d2a73c058bd66b7e177b73",
      "cosigners": [
        {
          "pub": "xpub661MyMwAqRbcG2SWCd7SPuXZiJf9Ve4txwoB6en8c8xFPRr4uDmUz3F5QtWdnot6qeK2jbmttCvTcDG254qybxdJUEV9B2kqLraG2Tc5cK1"
        },
        {
          "pub": "xpub661MyMwAqRbcFKpX1ZDiKqnRzy7GR7CdP4fvEa41uU2PX2vSNfhLFxDJkod3ru8jJGmDfBqasvFE4EA6gp4FqDCWCm9UbSNtU4iTj3EkeiG"
        }
      ],
      "authority": {
        "pub": "xpub661MyMwAqRbcGvSnxEsF3ozUA1kqjNE9fdBpDjKG6YvMuBCjiwf5w9DxDPubPpgpueWkczH21gJ1a7t7J7xw6fTiQmFiWd57opAgTRCCq1H",
        "path": "/0/0/1/20"
      },
      "coin": "tbch",
      "tx": "02000000012b21f4dc444b91c10bbacf048fec27730bd80dc99670ead531b5b9d7bf4104c101000000fdfd0000483045022100de36fe741f6541aa6485221aaabd3bce5f0335c68538d3b1218f4b7de51906dc022021ab523b0de1ec064b48d4a42119b81936008a9c466502a6179a952885dc46b24147304402202bbb7a2b6b6ad8ce3d1a87237b203981d923a5500a5f7827abe7e3f6556fd01702200f0ca09db08150c365998bcd45cce23b1b24839bd21eb5d62ab272459e2bf17c414c69522103808232b1bc89ed37476edd1638a75b24af52aa7c140126e86a5615e2d17c045d21021476547f77decae5a6b32428f7fd5c5a1a165be53e463f2cba6a149ca51bf4dc21026b0531f0dae953950134eaccd776cbbc575e29a58806374114b36ef278c205cd53aeffffffff02fb1700000000000017a9143bde603bc79fff22e2fda29b339d839e9b4d75398777b57d0f0000000017a914615bc84fed98ae4bbb5e8938c29a4a5cb6484b7e8700000000",
      "network": "testnet",
      "value": 259903582,
      "type": "permanent",
      "civicAsPrimary": false,
      "schema": "tbch-20180201"
    },
    "leaves": [
      {
        "identifier": "civ:Identity:name",
        "value": "urn:first:285a8c66e6d8f43cb283702e1d7cc90daf79a1c7ad25f2fe20aa7547116fef67:Joao|urn:last:a91a394ebe8994f1e881c15013aa1b27628d6e0354ad7ce0330ba561dc75db47:Santos|urn:middle:d44dc458743ebd1ac93007245a2651415f78b7f475c1c4b162b7aaf616a106e3:Barbosa|",
        "claimPath": "identity.name",
        "targetHash": "5650d74edbb4a0148e7f19f89df3e98ea9328a49e874123041b0fe6e25072fe3",
        "proof": [
          {
            "right": "8b3f8f06b6801e2f7e4d3078d8f3c8a522ce903eca350249cd9cf73daa8582be"
          },
          {
            "right": "cbdcd57d230006cae3d1c8d2c310cc24e5230813357e01d939ee372870d34912"
          },
          {
            "right": "8c40b790bf674653a0357418bde7befc3c3baf32c97369ae679133709a062fdd"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.first",
        "value": "urn:first:285a8c66e6d8f43cb283702e1d7cc90daf79a1c7ad25f2fe20aa7547116fef67:Joao",
        "claimPath": "identity.name.first",
        "targetHash": "8b3f8f06b6801e2f7e4d3078d8f3c8a522ce903eca350249cd9cf73daa8582be",
        "proof": [
          {
            "left": "5650d74edbb4a0148e7f19f89df3e98ea9328a49e874123041b0fe6e25072fe3"
          },
          {
            "right": "cbdcd57d230006cae3d1c8d2c310cc24e5230813357e01d939ee372870d34912"
          },
          {
            "right": "8c40b790bf674653a0357418bde7befc3c3baf32c97369ae679133709a062fdd"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.middle",
        "value": "urn:middle:d44dc458743ebd1ac93007245a2651415f78b7f475c1c4b162b7aaf616a106e3:Barbosa",
        "claimPath": "identity.name.middle",
        "targetHash": "145765549b2e429d2f204bc6f4c79c6b702a5f017ce2ff703bf6c1d29af3d555",
        "proof": [
          {
            "right": "9a059dedc58a623d41adf18e33452ebd9de6b9130152bb54ca0a0d2b8b4965bf"
          },
          {
            "left": "4f7776fc52f605ae20b5e814c9f68d81c59912ee73af8f75903c1832bdcac580"
          },
          {
            "right": "8c40b790bf674653a0357418bde7befc3c3baf32c97369ae679133709a062fdd"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Identity:name.last",
        "value": "urn:last:a91a394ebe8994f1e881c15013aa1b27628d6e0354ad7ce0330ba561dc75db47:Santos",
        "claimPath": "identity.name.last",
        "targetHash": "9a059dedc58a623d41adf18e33452ebd9de6b9130152bb54ca0a0d2b8b4965bf",
        "proof": [
          {
            "left": "145765549b2e429d2f204bc6f4c79c6b702a5f017ce2ff703bf6c1d29af3d555"
          },
          {
            "left": "4f7776fc52f605ae20b5e814c9f68d81c59912ee73af8f75903c1832bdcac580"
          },
          {
            "right": "8c40b790bf674653a0357418bde7befc3c3baf32c97369ae679133709a062fdd"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Identity:dateOfBirth",
        "value": "urn:day:bf08b91cd35c58a292dc863870279f6f830cdcf3e8adc96680ab820792930c92:00000020|urn:month:2bbe6772ac5c2d46d70ca25087921558b100146634c1e108d48afc29556f6bd4:00000003|urn:year:eafecd446e940db6013b23111416cbd195f5a3a719c7b11742b9716fbce44012:00001978|",
        "claimPath": "identity.dateOfBirth",
        "targetHash": "691aaec939c0d9a4eab7468ab46a437e04c2136e4c0237e2703ba4fd4a4b2d2d",
        "proof": [
          {
            "right": "64afc43b9b4b81b4a40f72257856a819d3b27486f07405a63269fa8d798843bb"
          },
          {
            "right": "2fec1daece49821628925c62c0987a5b155f6b98182be4bfb1492a9c09dc2e96"
          },
          {
            "left": "7318d1f8404486db45b07ab0b37de17da4a4a32e8852c119305039e32b5b6269"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Meta:issuer",
        "value": "urn:issuer:0b822a1fe0102bb015faa91b8477c80c493db79cdb1005a652fb5bbc9741c9cc:jest:test",
        "claimPath": "meta.issuer",
        "targetHash": "64afc43b9b4b81b4a40f72257856a819d3b27486f07405a63269fa8d798843bb",
        "proof": [
          {
            "left": "691aaec939c0d9a4eab7468ab46a437e04c2136e4c0237e2703ba4fd4a4b2d2d"
          },
          {
            "right": "2fec1daece49821628925c62c0987a5b155f6b98182be4bfb1492a9c09dc2e96"
          },
          {
            "left": "7318d1f8404486db45b07ab0b37de17da4a4a32e8852c119305039e32b5b6269"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
          }
        ]
      },
      {
        "identifier": "civ:Meta:issued",
        "value": "urn:issued:df4409776ee40a60cda4aeec6aa1d05691c0e8ffd55d9c23821b6e50d0c48d13:2018-07-04T00:11:55.698Z",
        "claimPath": "meta.issued",
        "targetHash": "76a3a4c07abc9439cd60a426977c22361d580faddbcfabb6d8a18ddd476ce05e",
        "proof": [
          {
            "right": "b4958af157dffab9d9e39810c60ea962d08aca925822a3403158d86c666f3381"
          },
          {
            "left": "d6030c82985569f7abe8602ac67bc5a3562e4f17329497c38c547ae9689a4ac8"
          },
          {
            "left": "7318d1f8404486db45b07ab0b37de17da4a4a32e8852c119305039e32b5b6269"
          },
          {
            "right": "90fba71c9292050d2f8673484901c84984b6f395b17fbd3cce35133e00c29751"
          },
          {
            "right": "e4617d7a402a5755b1a6b86862ff2e9d97644f76532b592ec3248e99d9d681b0"
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

