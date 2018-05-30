// That in consideration that this model is inspired by C++ language data definitions
// Changed: to lower case pattern UCA to Uca
const definitions = [
  {
    identifier: 'civ:Identity:name.first',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:firstName',
    version: 'v1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.first'],
  },
  {
    identifier: 'civ:Identity:givenName',
    version: 'v1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.first'],
  },
  {
    identifier: 'civ:Identity:name.middle',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.last',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.nickname',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Identity:name.username',
    version: 'v1',
    type: 'String',
    credentialItem: true,
    alsoKnown: ['civ:Identity:name.nickname'], // We can create alias (more precise dataSources)
  },
  {
    identifier: 'civ:Type:ShortToken', // We can create a Typedef that don't have an identifier. This means it't not a UCA but this is helpful to DRY
    version: 'v1',
    type: 'String',
    pattern: /^\d{5}$/, // We can specify a constraint to define the type domain
    credentialItem: false,
  },
  {
    identifier: 'civ:Verify:phoneNumber.Token',
    version: 'v1',
    type: 'civ:Type:ShortToken',
    credentialItem: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'civ:Verify:email.Token',
    version: 'v1',
    type: 'civ:Type:ShortToken',
    credentialItem: false,
  },
  {
    identifier: 'civ:Identity:name', // We can define a new identifier and the structure at same definition
    version: 'v1',
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
    version: 'v1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 32,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:Month',
    version: 'v1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true,
  },
  {
    identifier: 'civ:Type:Year',
    version: 'v1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
  },
  {
    identifier: 'civ:Type:Date',
    version: 'v1',
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
      },
      ],
      required: ['day', 'month', 'year'],
    },
  },
  {
    identifier: 'civ:Identity:DateOfBirth',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },
  {
    type: {
      identifier: 'civ:Type:DocType',
      name: 'DocType', // TODO ENUM
    },
  },
  {
    identifier: 'civ:Document:type',
    version: 'v1',
    type: 'DocType',
    credentialItem: true,
  },
  {
    identifier: 'civ:Document:number',
    version: 'v1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'civ:Document:DateOfExpiry',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
  },
  {
    identifier: 'civ:Document:DateOfBirth',
    version: 'v1',
    type: 'civ:Type:Date',
    credentialItem: true,
    alsoKnown: ['civ:Identity:DateOfBirth'],
  },
];

export default definitions;
