/**
 * name: 'attgenericId',
 * name: 'attBaseIdentity',
 * name: 'attAddress',
 * @type {*[]}
 */
const definitions = [
  {
    identifier: 'credential-cvc:Email-v1',
    version: '1',
    depends: [
      'cvc:Contact:email',
    ],
  },
  {
    identifier: 'credential-cvc:PhoneNumber-v1',
    version: '1',
    depends: [
      'cvc:Contact:phoneNumber',
    ],
  },
  {
    identifier: 'credential-cvc:GenericDocumentId-v1',
    version: '1',
    depends: [
      'cvc:Document:type',
      'cvc:Document:number',
      'cvc:Document:name',
      'cvc:Document:gender',
      'cvc:Document:issueLocation',
      'cvc:Document:issueAuthority',
      'cvc:Document:issueCountry',
      'cvc:Document:placeOfBirth',
      'cvc:Document:dateOfBirth',
      'cvc:Document:address',
      'cvc:Document:properties',
      'cvc:Document:image',
    ],
  },
  {
    identifier: 'credential-cvc:Address-v1',
    version: '1',
    depends: [
      'cvc:Identity:address',
    ],
  },
  {
    identifier: 'credential-cvc:Identity-v1',
    version: '1',
    depends: [
      'cvc:Identity:name',
      'cvc:Identity:dateOfBirth',
    ],
  },
];

module.exports = definitions;
