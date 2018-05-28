/* eslint-disable no-template-curly-in-string */
// ######################################### DEFINITIONS ###########################################


// That in consideration that this model is inpired by C++ language data definitions
// Changed: to lower case pattern UCA to Uca
const definitions = [
  {
    identifier: 'civic:200180528:name.first',
    type: String,
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:firstName',
    type: String,
    credentialItem: true,
    alsoKnown: ['civic:200180528:name.first'],
  },
  {
    identifier: 'civic:200180528:givenName',
    type: String,
    credentialItem: true,
    alsoKnown: ['civic:200180528:name.first'],
  },
  {
    identifier: 'civic:200180528:name.middle',
    type: String,
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:name.last',
    type: String,
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:name.nickname',
    type: String,
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:name.username',
    type: String,
    credentialItem: true,
    alsoKnown: ['civic:200180528:name.nickname'], // We can create alias (more precise dataSources)
  },
  {
    identifier: 'ShortToken', // We can create a Typedef that don't have an identifier. This means it't not a UCA but this is helpful to DRY
    type: {
      extend: 'String',
      pattern: /^\d{5}$/, // We can specify a constraint to define the type domain
    },
    credentialItem: false,
  },
  {
    identifier: 'civic:200180528:verifyPhoneNumberToken',
    type: 'ShortToken',
    credentialItem: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'civic:200180528:verifyEmailToken',
    type: 'ShortToken',
    credentialItem: false,
  },
  {
    identifier: 'civic:200180528:name', // We can define a new identifier and the structure at same definition
    type: {
      properties: [{
        name: 'first', // We need a key for templating and regex
        type: 'civic:200180528:name.first', // OR a type
        required: true,
      },
      {
        name: 'middle',
        type: 'civic:200180528:name.middle',
        required: false,
      },
      {
        key: 'last',
        type: 'civic:200180528:name.last',
        required: false,
      },
      {
        key: 'nickname',
        type: 'civic:200180528:name.nickname',
        required: false,
      },
      ],
      toString: '', // We need to define how we serialize structures
      fromString: /(?:<first>\S+) \((?:<aka>\S*)\), (?:<middle>\S+) (?:<last>\S+)/, // And how we deserialize too
    },
  },
  {
    identifier: 'Day',
    type: Number,
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 32,
    exclusiveMaximum: true
  },
  {
    identifier: 'Month',
    type: Number,
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true
  },
  {
    identifier: 'Year',
    type: Number,
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true
  },
  {
    identifier: 'Date',
    type: {
      properties: [{
        key: 'day',
        type: 'Day',
        required: true,
      },
      {
        key: 'month',
        type: 'Month',
        required: false,
      },
      {
        key: 'year',
        type: 'Year',
        required: true,
      },
      ],
      toString: '${year}-${month}-${day}',
      fromString: /\S*/, // this a place holder :-)
    },
  },
  {
    identifier: 'civic:200180528:DateOfBirth',
    type: 'Date',
    credentialItem: true,
  },
  {
    type: {
      name: 'DocType',
    },
  },
  {
    identifier: 'civic:200180528:documentId.type',
    type: 'DocType',
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:documentId.number',
    type: String,
    credentialItem: true,
  },

  {
    identifier: 'civic:200180528:documentId.DateOfExpiry',
    type: 'Date',
    credentialItem: true,
  },
  {
    identifier: 'civic:200180528:.DateOfBirth',
    type: 'Date',
    credentialItem: true,
    alsoKnown: ['civic:200180528:DateOfBirth'],
  }
];

export default { definitions };
