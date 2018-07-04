const temporaryVerifiableCredentialAttestation = {
  id: null,
  issuer: 'jest:test',
  issued: '2018-07-02T23:16:18.416Z',
  identifier: 'civ:Credential:SimpleTest',
  expiry: null,
  version: 1,
  type: [
    'Credential',
    'civ:Credential:SimpleTest',
  ],
  claims: {
    identity: {
      name: {
        first: 'Joao',
        last: 'Santos',
        middle: 'Barbosa',
      },
      dateOfBirth: {
        day: 20,
        month: 3,
        year: 1978,
      },
    },
  },
  signature: {
    type: 'CivicMerkleProof2018',
    merkleRoot: '022c53c7677875837d99cc1cc38bdfec3b56a758bcdddcd67671ad0747272ffd',
    anchor: {
      schema: 'tbch-20180201',
      tx: '01000000018233573015c04053158b3e312b276bc4adc2162a44fb527917d7676466caf33c00000000fc0047304402201345bd1afb1d8789d85369720b1a13369a9edef544df4b335fad09d0a5fe0c1502204a25c8920d70ef6652cfb60b550ce623131de9b1191be90594fb495df6eb00bd01473044022034476333e51a1132dfcc336d01809d6fbcb51bcaa80485519cdf5ec9a0d3d7180220542e5a73981cf6876e77f8c7d42a3813cbfff3bd12814488d83a61545956439f014c695221028f9205846d9b23dd9a17588ae13603aa3eda3599582750904716c827d02269db210381f2bf02be5f1576e36dcaa42e5960f33115b4150e4494a4b65739dbe99f45e52102d81b441641bcebb5b0a3e6c7628c416cdb5cbaf9021ce56ff499a24bf95e0ec353aeffffffff01551500000000000017a914512117a1030b2a1c038cb667f202edaf92ef26798700000000',
      subject: {
        label: 'civ:Credential:SimpleTest',
        pub: 'xpub661MyMwAqRbcFNXRK7kdsoidhiyfqiwhVhbphdKZjqnik83L1w1mWsPwVrsvbRrPa7sysiJRRBxr6jyrCbPScdXkhSjyYtQtFfwxGBwrBzn',
        data: '022c53c7677875837d99cc1cc38bdfec3b56a758bcdddcd67671ad0747272ffd',
        signature: '304402202dba9c4b08632648ba51ac8a490b76c5308f890f5860ccae2b8b8d45f733297d022012b080942741f190f6b6a00514ac85c9812a35374d56bebc4489b3b2dab92ccc',
      },
      authority: {
        pub: 'xpub661MyMwAqRbcGYsJt9oHuATcFJT277ajoJdwFsM23mxumR6xU4dvDRyNFE35Mshe1poDBwsiKAAuG2ayGq7rwUuzz1JS5at56MAzfVyBtud',
        path: '/1/0/0/0',
      },
      cosigners: [
        {
          pub: 'xpub661MyMwAqRbcGYsJt9oHuATcFJT277ajoJdwFsM23mxumR6xU4dvDRyNFE35Mshe1poDBwsiKAAuG2ayGq7rwUuzz1JS5at56MAzfVyBtud',
        },
        {
          pub: 'xpub661MyMwAqRbcGk5X8SrAKCoPJGDAjQePPk2ygNowv4sn97CPpgx5sNjKkE7gHWo6RHi1ECgkkxSf3zdbnjUErneogYzWefhnA8YigD6dzuY',
        },
      ],
      type: 'temporary',
      network: 'testnet',
      statusUrl: 'https://dev.api.civic.com/request-attestation-tbch/status/edf1aba0-7e4d-11e8-8555-eb7677af2a6d',
    },
    leaves: [
      {
        identifier: 'civ:Identity:name',
        value: 'urn:first:7ed2fdb5ffef649ed0d73a4eb16694c88f8ee63a5f44722ec0e498b2a8928220:Joao|urn:last:4c9c89dbbd17c7c72f5d2e7d30f2b7efee0bc0a9c7bf7862ceffd4c3cc8f8a99:Santos|urn:middle:d7d5f27dcd3a8486ff2a51311b0a25c0a771c301784ff9fd45bd036b08bebdae:Barbosa|',
        claimPath: 'identity.name',
        targetHash: '21b3b88c0e291f23509f5ce1a1afedd691a430766d6445a56993a0c464765d0e',
        proof: [
          {
            right: 'c1ec3784fc70405b2b04b5e021121c5947b7cc190cb1b189f8a137b5524549a4',
          },
          {
            right: 'f7c313ba270b6bfc1414a2ee7ced744091309d07f76e952ab92dbf9cbe70bc5a',
          },
          {
            right: '2a6104abe4c86ddf192bc3a4f3ec9db43f86305f4781885c5b2939a1179ca5ab',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Identity:name.first',
        value: 'urn:first:7ed2fdb5ffef649ed0d73a4eb16694c88f8ee63a5f44722ec0e498b2a8928220:Joao',
        claimPath: 'identity.name.first',
        targetHash: 'c1ec3784fc70405b2b04b5e021121c5947b7cc190cb1b189f8a137b5524549a4',
        proof: [
          {
            left: '21b3b88c0e291f23509f5ce1a1afedd691a430766d6445a56993a0c464765d0e',
          },
          {
            right: 'f7c313ba270b6bfc1414a2ee7ced744091309d07f76e952ab92dbf9cbe70bc5a',
          },
          {
            right: '2a6104abe4c86ddf192bc3a4f3ec9db43f86305f4781885c5b2939a1179ca5ab',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Identity:name.middle',
        value: 'urn:middle:d7d5f27dcd3a8486ff2a51311b0a25c0a771c301784ff9fd45bd036b08bebdae:Barbosa',
        claimPath: 'identity.name.middle',
        targetHash: '5045a0927cac1c0efc12a8f1c428cc8da5a6968d2505d692d83a26f7641ee50d',
        proof: [
          {
            right: 'd2b3f5e53d651889a7751466322fb96d61347104fbb96a5c170bc2ee5053692e',
          },
          {
            left: '1becbaf6a9ee78c429422964fcf18bd09d4f2ff12555c92f879ce12654b3f9d3',
          },
          {
            right: '2a6104abe4c86ddf192bc3a4f3ec9db43f86305f4781885c5b2939a1179ca5ab',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Identity:name.last',
        value: 'urn:last:4c9c89dbbd17c7c72f5d2e7d30f2b7efee0bc0a9c7bf7862ceffd4c3cc8f8a99:Santos',
        claimPath: 'identity.name.last',
        targetHash: 'd2b3f5e53d651889a7751466322fb96d61347104fbb96a5c170bc2ee5053692e',
        proof: [
          {
            left: '5045a0927cac1c0efc12a8f1c428cc8da5a6968d2505d692d83a26f7641ee50d',
          },
          {
            left: '1becbaf6a9ee78c429422964fcf18bd09d4f2ff12555c92f879ce12654b3f9d3',
          },
          {
            right: '2a6104abe4c86ddf192bc3a4f3ec9db43f86305f4781885c5b2939a1179ca5ab',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Identity:dateOfBirth',
        value: 'urn:day:0ddd259d4f0e4dfc87e2a0e6a523f40f595fcde8d2e19c0622c3c80621997fa6:00000020|urn:month:22b9db0d0b83bd8996357bb11cfc87b8a45a788d1e0e55a6ce55ab379244b486:00000003|urn:year:b01beff1e64ed1b877905bfc49b6388881ad02ce6f51a58d7a296fc9e107c3dc:00001978|',
        claimPath: 'identity.dateOfBirth',
        targetHash: 'f815aee1f8732074dd6e999f45e28dc3bb3df03610a1d4b57a12c7c5e81594fc',
        proof: [
          {
            right: 'aecb5689321f916386a692da401fbc9ece1364f62ef2c73dc90832d39e942604',
          },
          {
            right: 'dd14ea078b5d35171aa622aa3156f36a2ed1f19f248738e5643518993ad411f3',
          },
          {
            left: 'd52cf5bab6d72b03d6e3433a9058d3f7a31f6918c91d131b31ed311e03b17d1a',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Meta:issuer',
        value: 'urn:issuer:8018273f0eaa5dfc62f5c40853d5ebc56694651a136b0bdf83ef02a3a1e5a5c6:jest:test',
        claimPath: 'meta.issuer',
        targetHash: 'aecb5689321f916386a692da401fbc9ece1364f62ef2c73dc90832d39e942604',
        proof: [
          {
            left: 'f815aee1f8732074dd6e999f45e28dc3bb3df03610a1d4b57a12c7c5e81594fc',
          },
          {
            right: 'dd14ea078b5d35171aa622aa3156f36a2ed1f19f248738e5643518993ad411f3',
          },
          {
            left: 'd52cf5bab6d72b03d6e3433a9058d3f7a31f6918c91d131b31ed311e03b17d1a',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
      {
        identifier: 'civ:Meta:issued',
        value: 'urn:issued:be042195a3a1c240a35135167c81f6015476ced80b9aed433671415de433383d:2018-07-02T23:16:18.416Z',
        claimPath: 'meta.issued',
        targetHash: 'f639dae7b687121699c91e50848ceba1b255fb41f78ae69a37d33d690784c3a3',
        proof: [
          {
            right: '6e258a4ff50d5eb3cfe3f8d173194124c3fd5eea5680354fbf0867d4512a44d2',
          },
          {
            left: '66710f4003e22cbf1e8d7e4a0289f078cdd98ef097b103ece14317972afbfaa6',
          },
          {
            left: 'd52cf5bab6d72b03d6e3433a9058d3f7a31f6918c91d131b31ed311e03b17d1a',
          },
          {
            right: 'ed040b0aafa2b1e86fa315c27b9d0589461a4d97f741fe08c9b232a27a185531',
          },
          {
            right: '65734d12d11ac5390c8b0847223e9c9feb5854672a71c3a21b195af9372a0339',
          },
        ],
      },
    ],
  },
};

module.exports = { tempAttestation };
