/* eslint-disable no-template-curly-in-string */
// ######################################### DEFINITIONS ###########################################

const definitions = [
  {
    identifier: 'cvc:Meta:issuer',
    description: 'Credential Issuer',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'cvc:Meta:issuanceDate',
    description: 'Credential date of issuance',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'cvc:Meta:expirationDate',
    description: 'Credential expiration data',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'cvc:Random:node',
    description: 'a random node on the merkleTree, ',
    version: '1',
    type: 'String',
    attestable: true,
  },
  {
    identifier: 'cvc:Domain:localPart',
    description: 'also known as email domian',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Domain:tld',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Email:address',
    description: 'also known as email user',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Type:domain',
    version: '1',
    type: {
      properties: [
        {
          name: 'tld',
          type: 'cvc:Domain:tld',
        },
        {
          name: 'localPart',
          type: 'cvc:Domain:localPart',
        },
      ],
      required: ['localPart', 'tld'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Email:domain',
    version: '1',
    type: 'cvc:Type:domain',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Contact:email',
    version: '1',
    type: {
      properties: [
        {
          name: 'domain',
          type: 'cvc:Email:domain',
        },
        {
          name: 'address',
          type: 'cvc:Email:address',
        },
      ],
    },
    credentialItem: true,
  },
  {
    identifier: 'cvc:User:id',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:User:realm',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:country',
    version: 1,
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Phone:countryCode',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Phone:number',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Phone:extension',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Phone:lineType',
    version: 1,
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Contact:phoneNumber',
    version: 1,
    type: {
      properties: [
        {
          name: 'country',
          type: 'cvc:Type:country',
        },
        {
          name: 'countryCode',
          type: 'cvc:Phone:countryCode',
        },
        {
          name: 'number',
          type: 'cvc:Phone:number',
        },
        {
          name: 'extension',
          type: 'cvc:Phone:extension',
        },
        {
          name: 'lineType',
          type: 'cvc:Phone:lineType',
        },
      ],
      required: ['country', 'countryCode', 'number', 'lineType'],
    },
    credentialItem: true,
  },
  {
    identifier: 'cvc:Name:givenNames',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Name:familyNames',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Name:otherNames',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:Name',
    version: '1',
    type: {
      properties: [
        {
          name: 'givenNames',
          type: 'cvc:Name:givenNames',
        },
        {
          name: 'familyNames',
          type: 'cvc:Name:familyNames',
        },
        {
          name: 'otherNames',
          type: 'cvc:Name:otherNames',
        },
      ],
      required: ['givenNames'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Document:name',
    version: '1',
    type: 'cvc:Type:Name',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Identity:name',
    version: '1',
    type: 'cvc:Type:Name',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:shortToken',
    version: '1',
    type: 'String',
    pattern: '/^\\d{5}$/', // We can specify a constraint to define the type domain
    credentialItem: false,
  },
  {
    identifier: 'cvc:Verify:phoneNumberToken',
    version: '1',
    type: 'cvc:Type:shortToken',
    credentialItem: false, // An example on UCA that only relates with the user in short term
  },
  {
    identifier: 'cvc:Verify:emailToken',
    version: '1',
    type: 'cvc:Type:shortToken',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Document:number',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:day',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 32,
    exclusiveMaximum: true,
  },
  {
    identifier: 'cvc:Type:month',
    version: '1',
    type: 'Number',
    minimum: 0,
    exclusiveMinimum: true,
    maximum: 13,
    exclusiveMaximum: true,
  },
  {
    identifier: 'cvc:Type:year',
    version: '1',
    type: 'Number',
    minimum: 1900,
    exclusiveMinimum: true,
  },
  {
    identifier: 'cvc:Type:date',
    version: '1',
    type: {
      properties: [{
        name: 'day',
        type: 'cvc:Type:day',
      },
      {
        name: 'month',
        type: 'cvc:Type:month',
      },
      {
        name: 'year',
        type: 'cvc:Type:year',
      }],
      required: ['day', 'month', 'year'],
    },
  },
  {
    identifier: 'cvc:Identity:dateOfBirth',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Address:street',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'cvc:Address:unit',
    version: '1',
    type: 'String',
  },

  {
    identifier: 'cvc:Address:city',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'cvc:Address:postalCode',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'cvc:Address:state',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Address:county',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'cvc:Address:country',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:address',
    version: '1',
    type: {
      properties: [
        {
          name: 'country',
          type: 'cvc:Address:country',
        },
        {
          name: 'county',
          type: 'cvc:Address:county',
        },
        {
          name: 'state',
          type: 'cvc:Address:state',
        },
        {
          name: 'street',
          type: 'cvc:Address:street',
        },
        {
          name: 'unit',
          type: 'cvc:Address:unit',
        },
        {
          name: 'city',
          type: 'cvc:Address:city',
        },
        {
          name: 'postalCode',
          type: 'cvc:Address:postalCode',
        },
      ],
      required: ['street', 'unit', 'city', 'state', 'country'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Document:address',
    version: 1,
    type: 'cvc:Type:address',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Identity:address',
    version: 1,
    type: 'cvc:Type:address',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:dateOfIssue',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:dateOfExpiry',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:dateOfBirth',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:properties',
    version: '1',
    type: {
      properties: [
        {
          name: 'dateOfIssue',
          type: 'cvc:Document:dateOfIssue',
        },
        {
          name: 'dateOfExpiry',
          type: 'cvc:Document:dateOfExpiry',
        },
      ],
      required: ['dateOfIssue'],
    },
    credentialItem: true,
  },
  {
    identifier: 'cvc:Type:s3FileBucket',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:s3FileKey',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:ContentType',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:MD5',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:ImageBase64',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:S3FileRef',
    version: '1',
    type: {
      properties: [
        {
          name: 'Bucket',
          type: 'cvc:Type:s3FileBucket',
        },
        {
          name: 'Key',
          type: 'cvc:Type:s3FileKey',
        },
        {
          name: 'MD5',
          type: 'cvc:Type:MD5',
        },
        {
          name: 'ContentType',
          type: 'cvc:Type:ContentType',
        },
      ],
      required: ['Bucket', 'Key', 'MD5', 'ContentType'],
    },
  },
  {
    identifier: 'cvc:Type:DocumentFace',
    version: '1',
    type: 'String',
  },
  {
    identifier: 'cvc:Type:S3DocumentImageRef',
    version: '1',
    type: {
      properties: [
        {
          name: 'type',
          type: 'cvc:Document:type',
        },
        {
          name: 'face',
          type: 'cvc:Type:DocumentFace',
        },
        {
          name: 'reference',
          type: 'cvc:Type:S3FileRef',
        },
      ],
      required: ['type', 'face', 'reference'],
    },
  },
  {
    identifier: 'cvc:Document:image',
    version: '1',
    type: {
      properties: [
        {
          name: 'front',
          type: 'cvc:Type:ImageBase64',
        },
        {
          name: 'frontMD5',
          type: 'cvc:Type:MD5',
        },
        {
          name: 'back',
          type: 'cvc:Type:ImageBase64',
        },
        {
          name: 'backMD5',
          type: 'cvc:Type:MD5',
        },
      ],
      required: ['front', 'frontMD5'],
      credentialItem: true,
    },
  },
  {
    identifier: 'cvc:Document:type',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:gender',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:issueLocation',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:issueAuthority',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:issueCountry',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'cvc:Document:placeOfBirth',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
];

module.exports = definitions;
