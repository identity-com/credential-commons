// ######################################### DEFINITIONS ###########################################
const definitions = [
  {
    identifier: 'claim-cvc:email.domain-v1',
    version: '1',
    type: 'cvc:Type:domain',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:email.properties-v1',
    version: '1',
    type: 'cvc:Type:email',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:contact.email-v1',
    version: '1',
    type: 'claim-cvc:email.properties-v1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:user.id-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:user.realm-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phone.countryCode-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phone.number-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phone.extension-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phone.lineType-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phoneNumber.countryCode-v1',
    type: 'claim-cvc:phone.countryCode-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phoneNumber.number-v1',
    type: 'claim-cvc:phone.number-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phoneNumber.extension-v1',
    type: 'claim-cvc:phone.extension-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:phoneNumber.lineType-v1',
    type: 'claim-cvc:phone.lineType-v1',
    version: '1',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:contact.phoneNumber-v1',
    version: '1',
    type: 'cvc:Type:phoneNumber',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:name.givenNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:name.familyNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:name.otherNames-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Type.Name-v1',
    version: '1',
    type: {
      properties: [
        {
          name: 'givenNames',
          type: 'claim-cvc:name.givenNames-v1',
        },
        {
          name: 'familyNames',
          type: 'claim-cvc:name.familyNames-v1',
        },
        {
          name: 'otherNames',
          type: 'claim-cvc:name.otherNames-v1',
        },
      ],
      required: ['givenNames'],
    },
    credentialItem: false,
  },
  {
    identifier: 'claim-cvc:Document.name-v1',
    version: '1',
    type: 'cvc:Type:Name',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.name-v1',
    version: '1',
    type: 'cvc:Type:Name',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.number-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.dateOfBirth-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.city-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.postalCode-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'claim-cvc:Address.state-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Address.county-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },

  {
    identifier: 'claim-cvc:Address.country-v1',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.address-v1',
    version: '1',
    type: 'cvc:Type:address',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Identity.address-v1',
    version: '1',
    type: 'cvc:Type:address',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfIssue-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfExpiry-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.dateOfBirth-v1',
    version: '1',
    type: 'cvc:Type:date',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.type-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.gender-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueLocation-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueAuthority-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.issueCountry-v1',
    version: '1',
    type: 'cvc:Type:country',
    credentialItem: true,
  },
  {
    identifier: 'claim-cvc:Document.placeOfBirth-v1',
    version: '1',
    type: 'String',
    credentialItem: true,
  },
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
    identifier: 'cvc:Domain:name',
    description: 'also known as email address domain',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Domain:tld',
    description: 'also known as email address domain suffix, like .com, .org, .com.br',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Email:username',
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
          name: 'name',
          type: 'cvc:Domain:name',
        },
      ],
      required: ['name', 'tld'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Type:email',
    version: '1',
    type: {
      properties: [
        {
          name: 'username',
          type: 'cvc:Email:username',
        },
        {
          name: 'domain',
          type: 'claim-cvc:email.domain-v1',
        },
      ],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Type:country',
    version: '1',
    type: 'String',
    credentialItem: false,
  },
  {
    identifier: 'cvc:PhoneNumber:country',
    type: 'cvc:Type:country',
    version: '1',
    credentialItem: false,
  },
  {
    identifier: 'cvc:Type:phoneNumber',
    version: '1',
    type: {
      properties: [
        {
          name: 'country',
          type: 'cvc:PhoneNumber:country',
        },
        {
          name: 'countryCode',
          type: 'claim-cvc:phoneNumber.countryCode-v1',
        },
        {
          name: 'number',
          type: 'claim-cvc:phoneNumber.number-v1',
        },
        {
          name: 'extension',
          type: 'claim-cvc:phoneNumber.extension-v1',
        },
        {
          name: 'lineType',
          type: 'claim-cvc:phoneNumber.lineType-v1',
        },
      ],
      required: ['country', 'countryCode', 'number', 'lineType'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Type:Name',
    version: '1',
    type: {
      properties: [
        {
          name: 'givenNames',
          type: 'claim-cvc:name.givenNames-v1',
        },
        {
          name: 'familyNames',
          type: 'claim-cvc:name.familyNames-v1',
        },
        {
          name: 'otherNames',
          type: 'claim-cvc:name.otherNames-v1',
        },
      ],
      required: ['givenNames'],
    },
    credentialItem: false,
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
    identifier: 'cvc:Type:address',
    version: '1',
    type: {
      properties: [
        {
          name: 'country',
          type: 'claim-cvc:Address.country-v1',
        },
        {
          name: 'county',
          type: 'claim-cvc:Address.county-v1',
        },
        {
          name: 'state',
          type: 'claim-cvc:Address.state-v1',
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
          type: 'claim-cvc:Address.city-v1',
        },
        {
          name: 'postalCode',
          type: 'claim-cvc:Address.postalCode-v1',
        },
      ],
      required: ['street', 'unit', 'city', 'state', 'country'],
    },
    credentialItem: false,
  },
  {
    identifier: 'cvc:Document:properties',
    version: '1',
    attestable: true,
    type: {
      properties: [
        {
          name: 'dateOfIssue',
          type: 'claim-cvc:Document.dateOfIssue-v1',
        },
        {
          name: 'dateOfExpiry',
          type: 'claim-cvc:Document.dateOfExpiry-v1',
        },
      ],
      required: ['dateOfIssue'],
    },
    credentialItem: false,
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
          type: 'claim-cvc:Document.type-v1',
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
    identifier: 'cvc:Document:front',
    version: '1',
    type: 'cvc:Type:ImageBase64',
  },
  {
    identifier: 'cvc:Document:frontMD5',
    version: '1',
    type: 'cvc:Type:MD5',
  },
  {
    identifier: 'cvc:Document:back',
    version: '1',
    type: 'cvc:Type:ImageBase64',
  },
  {
    identifier: 'cvc:Document:backMD5',
    version: '1',
    type: 'cvc:Type:MD5',
  },
  {
    identifier: 'cvc:Document:image',
    version: '1',
    attestable: true,
    type: {
      properties: [
        {
          name: 'front',
          type: 'cvc:Document:front',
        },
        {
          name: 'frontMD5',
          type: 'cvc:Document:frontMD5',
        },
        {
          name: 'back',
          type: 'cvc:Document:back',
        },
        {
          name: 'backMD5',
          type: 'cvc:Document:backMD5',
        },
      ],
      required: ['front', 'frontMD5'],
    },
  },


];

module.exports = definitions;
