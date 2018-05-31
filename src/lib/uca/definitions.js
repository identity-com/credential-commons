/* eslint-disable no-template-curly-in-string */
// ######################################### DEFINITIONS ###########################################


// That in consideration that this model is inpired by C++ language data definitions
// Changed: to lower case pattern UCA to Uca
const definitions = [
  {
    identifier: 'civ:Random:node',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'civ:Identity:name.first',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:firstName',
    version: '1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.first'],
  },
  {
    identifier: 'civ:Identity:givenName',
    version: '1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.first'],
  },
  {
    identifier: 'civ:Identity:name.middle',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.last',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.nickname',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.username',
    version: '1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.nickname'], // We can create alias (more precise dataSources)
  },
  {
    identifier: 'civ:Type:ShortToken', // We can create a Typedef that don't have an identifier. This means it't not a UCA but this is helpful to DRY
    version: '1',
    type: 'String',
    pattern: /^\d{5}$/, // We can specify a constraint to define the type domain
    credentialItem: false,
  },
  {
    identifier: 'civ:Verify:phoneNumber.Token',
    version: '1',
    type: 'civ:Type:ShortToken',
    credentialItem: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'civ:Verify:email.Token',
    version: '1',
    type: 'civ:Type:ShortToken',
    credentialItem: false,
  },
  {
    identifier: 'civ:Identity:name', // We can define a new identifier and the structure at same definition
    version: '1',
    type: {
      properties: [{
        name: 'first', // We need a key for templating and regex
        type: 'civ:Identity:name.first', // OR a type
      },
      {
        name: 'middle',
        type: 'civ:Identity:name.middle',
      },
      {
        name: 'last',
        type: 'civ:Identity:name.last',
      },
      {
        name: 'nickname',
        type: 'civ:Identity:name.nickname',
      },
      ],
      required: ['first'],
    },
    credentialItem: true,
  },
  {
    identifier: 'civ:Type:Day',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 32,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:Month',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:Year',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
  },
  {
    identifier: 'civ:Type:Date',
    version: '1',
    type: {
      properties: [{
        name: 'day',
        type: 'civ:Type:Day',
      },
      {
        name: 'month',
        type: 'civ:Type:Month',
      },
      {
        name: 'year',
        type: 'civ:Type:Year',
      }],
      required: ['day', 'month', 'year'],
    },
  },
  {
    identifier: 'civ:Identity:DateOfBirth',
    version: '1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },
  {
    type: {
      identifier: 'civ:Type:DocType',
      name: 'DocType', // TODO ENUM
      values: ['genericId', 'passport', 'idCard', 'driversLicense'],
    },
  },
  {
    identifier: 'civ:Document:type',
    version: '1',
    type: 'DocType',
    credentialItem: true,
  },
  {
    identifier: 'civ:Document:number',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:DateOfExpiry',
    version: '1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },
  {
    identifier: 'civ:Document:DateOfBirth',
    version: '1',
    type: 'civ:Type:Date',
    credentialItem: true,
    alsoKnown: ['civ:Identity:DateOfBirth'],
  },

  {
    identifier: 'civ:Document:genericId.type',
    version: 'v1',
    type: 'String', // TODO DocType?
  },

  {
    identifier: 'civ:Document:genericId.number',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.name',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.given.names',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.surname',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.sex',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.issueLocation',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.issueAuthority',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.image',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.image.md5',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:genericId.unit',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.number',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.address',
    version: 'v1',
    type: 'civ:Type:Address',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.name',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.given.names',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.surname',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.sex',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.issueLocation',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:idCard.issueAuthority',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.image',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:idCard.image.md5',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.number',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.name',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.given.names',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.surname',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.type',
    version: 'v1',
    type: 'String',
    credentialItem: true,
    values: ['A', 'B', 'C', 'D', 'E'],
  },

  {
    identifier: 'civ:Document:driversLicense.issueLocation',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.issueAuthority',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.dateOfIssue',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.dateOfExpiry',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.dateOfBirth',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },

  {
    identifier: 'civ:Document:driversLicense.comments',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:driversLicense.address',
    version: 'v1',
    type: 'civ:Type:Address',
  },

  {
    identifier: 'civ:Document:driversLicense.image.front',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:driversLicense.image.front_md5',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:driversLicense.image.back',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:driversLicense.image.back_md5',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.number',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.type',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.issuing.country',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.name',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.given.names',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.surname',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.nationality',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.dateOfBirth',
    version: 'v1',
    type: 'civ:Type:Date',
  },

  {
    identifier: 'civ:Document:passport.sex',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.placeOfBirth',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.filiation.mother',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.filiation.father',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.dateOfIssue',
    version: 'v1',
    type: 'civ:Type:Date',
  },

  {
    identifier: 'civ:Document:passport.dateOfExpiry.day',
    version: 'v1',
    type: 'civ:Type:Day',
  },

  {
    identifier: 'civ:Document:passport.dateOfExpiry.month',
    version: 'v1',
    type: 'civ:Type:Month',
  },

  {
    identifier: 'civ:Document:passport.dateOfExpiry.year',
    version: 'v1',
    type: 'civ:Type:Year',
  },

  {
    identifier: 'civ:Document:passport.authority',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.image',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Document:passport.image.md5',
    version: 'v1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:Email',
    version: '1',
    type: {
      properties: [{
        name: 'user',
        type: 'String',
      },
      {
        name: 'domain',
        type: 'String',
      }],
      required: ['user', 'domain'],
    },
  },

  {
    identifier: 'civ:Contact:personal',
    version: 'v1',
    type: 'civ:Type:Address',
  },

  {
    identifier: 'civ:Address',
    version: '1',
    type: {
      properties: [
        {
          name: 'street',
          identifier: 'civ:Address.street',
        },
        {
          name: 'unit',
          identifier: 'civ:Address.unit',
        },
        {
          name: 'city',
          identifier: 'civ:Address.city',
        },
        {
          name: 'zipCode',
          identifier: 'civ:Address.zipCode',
        },
        {
          name: 'state',
          identifier: 'civ:Address.state',
        },
        {
          name: 'county',
          identifier: 'civ:Address.county',
        },
        {
          name: 'country',
          identifier: 'civ:Address.country',
        },
      ],
      required: ['country'],
    },
    credentialItem: true,
  },
];

export default definitions;
