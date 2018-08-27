/**
 * name: 'attgenericId',
 * name: 'attBaseIdentity',
 * name: 'attAddress',
 * @type {*[]}
 */
const definitions = [
  {
    identifier: 'civ:Credential:CivicBasic',
    version: '1',
    depends: [
      'civ:Type:phone',
      'civ:Type:email',
    ],
  },
  {
    identifier: 'civ:Credential:GenericId',
    version: '1',
    depends: [
      'civ:Type:address',
      'civ:Type:documentType',
      'civ:Type:documentNumber',
      'civ:Type:image',
      'civ:Identity:name',
      'civ:Identity:givenName',
      'civ:Identity:dateOfBirth',
      'civ:Identity:dateOfIssue',
      'civ:Identity:dateOfExpiry',
    ],
  },
  {
    identifier: 'civ:Credential:Address',
    version: '1',
    depends: [
      'civ:Type:address',
    ],
  },
];

module.exports = definitions;
