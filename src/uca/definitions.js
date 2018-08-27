/* eslint-disable no-template-curly-in-string */
// ######################################### DEFINITIONS ###########################################


// That in consideration that this model is inpired by C++ language data definitions
// Changed: to lower case pattern UCA to Uca
const definitions = [
  {
    identifier: 'civ:Meta:issuer',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'civ:Meta:issued',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'civ:Meta:expiry',
    version: '1',
    type: 'String',
    attestable: true,
  },
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
    required: true,
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
    identifier: 'civ:Type:shortToken', // We can create a Typedef that don't have an identifier. This means it't not a UCA but this is helpful to DRY
    version: '1',
    type: 'String',
    pattern: '/^\\d{5}$/', // We can specify a constraint to define the type domain
    credentialItem: false,
  },
  {
    identifier: 'civ:Verify:phoneNumber.token',
    version: '1',
    type: 'civ:Type:shortToken',
    credentialItem: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'civ:Verify:email.token',
    version: '1',
    type: 'civ:Type:shortToken',
    credentialItem: false,
  },
  {
    identifier: 'civ:Type:documentType',
    version: '1',
    type: 'String', // change to Array and change the constructor and SchemaGenerator
    credentialItem: true,
  },
  {
    identifier: 'civ:Type:documentNumber',
    version: '1',
    type: 'Number',
    credentialItem: true,
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
    identifier: 'civ:Type:day',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 32,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:month',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:year',
    version: '1',
    type: 'Number',
    minimum: 1900,
    exclusiveMinimum: true,
  },
  {
    identifier: 'civ:Type:date',
    version: '1',
    type: {
      properties: [{
        name: 'day',
        type: 'civ:Type:day',
      },
      {
        name: 'month',
        type: 'civ:Type:month',
      },
      {
        name: 'year',
        type: 'civ:Type:year',
      }],
      required: ['day', 'month', 'year'],
    },
  },
  {
    identifier: 'civ:Identity:dateOfBirth',
    version: '1',
    type: 'civ:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:dateOfIssue',
    version: '1',
    type: 'civ:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:dateOfExpiry',
    version: '1',
    type: 'civ:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'civ:Type:address.street',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.unit',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.city',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.zipCode',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.state',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.county',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address.country',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:address',
    version: '1',
    type: {
      properties: [
        {
          name: 'street',
          type: 'civ:Type:address.street',
        },
        {
          name: 'unit',
          type: 'civ:Type:address.unit',
        },
        {
          name: 'city',
          type: 'civ:Type:address.city',
        },
        {
          name: 'zipCode',
          type: 'civ:Type:address.zipCode',
        },
        {
          name: 'state',
          type: 'civ:Type:address.state',
        },
        {
          name: 'county',
          type: 'civ:Type:address.county',
        },
        {
          name: 'country',
          type: 'civ:Type:address.country',
        },
      ],
      required: ['country'],
    },
    credentialItem: true,
  },

  {
    identifier: 'civ:Type:email.user',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:email.domain',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:email',
    version: '1',
    type: {
      properties: [{
        name: 'user',
        type: 'civ:Type:email.user',
      },
      {
        name: 'domain',
        type: 'civ:Type:email.domain',
      }],
      required: ['user', 'domain'],
    },
  },

  {
    identifier: 'civ:Type:phone.number',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:phone.countryCode',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:phone',
    version: '1',
    type: {
      properties: [{
        name: 'number',
        type: 'civ:Type:phone.number',
        pattern: '/\\d*/',
      },
      {
        name: 'countryCode',
        type: 'civ:Type:phone.countryCode',
      }],
      required: ['countryCode', 'number'],
    },
  },

  {
    identifier: 'civ:Type:image.image',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:image.md5',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'civ:Type:image',
    version: '1',
    type: {
      properties: [{
        name: 'image',
        type: 'civ:Type:image.image',
      },
      {
        name: 'md5',
        type: 'civ:Type:image.md5',
      }],
      required: ['image', 'md5'],
    },
  },
];

module.exports = definitions;
