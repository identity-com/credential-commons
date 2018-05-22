/* eslint-disable no-template-curly-in-string */
// ######################################### DEFINITIONS ###########################################
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
// TODO jpsantosbh review please, changed from String to ES types
const builtInTypedefs = [
  {
    name: 'String',
  },
  {
    name: 'Number',
  },
  {
    name: 'Boolean',
  },
];


// That in consideration that this model is inpired by C++ language data definitions
// Changed: to lower case pattern UCA to Uca
const definitions = [
  {
    identifier: 'identity.name.first', // Creating a new identifier is equivalent to a new Typedef
    type: String,
    persistent: true, // This indicates the the relation with the user is ephemeral or not
  },
  {
    identifier: 'identity.name.middle',
    type: String,
    persistent: true,
  },
  {
    identifier: 'identity.name.last',
    type: String,
    persistent: true,
  },
  {
    identifier: 'identity.nickname',
    type: String,
    persistent: true,
  },
  {
    identifier: 'identity.name.aka',
    type: String,
    persistent: true,
  },
  {
    identifier: 'identity.name.aka',
    type: String,
    persistent: true,
    alsoKnown: ['identity.nickname'], // We can create alias (more precise dataSources)
  },
  {
    identifier: null, // We can create a Typedef that don't have an identifier. This means it't not a UCA but this is helpful to DRY
    Typedef: {
      name: 'ShortToken',
      extend: 'String',
      constraint: /^\d{5}$/, // We can specify a constraint to define the type domain
    },
  },
  {
    identifier: 'identity.contact.phoneNUmber.token',
    type: 'ShortToken',
    persistent: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'identity.contact.email.token',
    type: 'ShortToken',
    persistent: false,
  },
  {
    identifier: 'identity.name', // We can define a new identifier and the structure at same definition
    Typedef: {
      name: 'IdentityName',
      components: [{
        key: 'first', // We need a key for templating and regex
        ref: 'identity.name.first', // We can define the type using a UCA identifier
        type: null, // OR a type
        required: true,
      },
      {
        key: 'middle',
        ref: 'identity.name.middle',
        required: false,
      },
      {
        key: 'last',
        ref: 'identity.name.last',
        required: true,
      },
      {
        key: 'aka',
        ref: 'identity.name.aka',
        required: false,
      },
      ],
      toString: '${first} (${aka}), ${middle} ${last}', // We need to define how we serialize structures
      fromString: /(?:<first>\S+) \((?:<aka>\S*)\), (?:<middle>\S+) (?:<last>\S+)/, // And how we deserialize too
    },
  },
  {
    identifier: null,
    Typedef: {
      name: 'Day',
      extend: Number,
      constraints: ['int()', 'gt(0)', 'lte(31)'], // If needed we can use a constrain set to define the domain
    },
  },
  {
    identifier: null,
    Typedef: {
      name: 'Month',
      extend: Number,
      constraints: ['int()', 'gt(0)', 'lte(12)'],
    },
  },
  {
    identifier: null,
    Typedef: {
      name: 'Year',
      extend: Number,
      constraints: ['int()', 'gt(0)', 'lte(12)'],
    },
  },
  {
    identifier: null,
    Typedef: {
      name: 'Date',
      components: [{
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
    identifier: 'identity.DateOfBirth',
    type: 'Date',
    persistent: true,
  },
  {
    Typedef: {
      name: 'DocType',

    },
  },
  {
    identifier: 'identity.documentId.type',
    type: 'DocType',
    persistent: true,
  },
  {
    identifier: 'identity.documentId.number',
    type: String,
    persistent: true,
  },

  {
    identifier: 'identity.documentId.DateOfExpiry',
    type: 'Date',
    persistent: true,
  },
  {
    identifier: 'identity.documentId.DateOfBirth', // We what to have both avaliable for requestors (for convinience)
    type: 'Date',
    persistent: true,
    alsoKnown: ['identity.DateOfBirth'], // A good use case for aliasing
  },
];

export { builtInTypedefs, definitions };
