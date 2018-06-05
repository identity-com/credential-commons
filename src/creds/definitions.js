/**
 * TODO Talk to Martin understand the difference between Creds vs Uca
 * TODO Talk to Martin about the creds names
 * name: 'attUtilityBill',
 * name: 'attgenericId',
 * name: 'attIdCard',
 * name: 'attDriveLicense',
 * name: 'attPassport',
 * name: 'attDevice',
 * name: 'attVLevel',
 * name: 'attBaseIdentity',
 * name: 'attIdentityDocs',
 * name: 'attAddress',
 * @type {*[]}
 */
const definitions = [
  {
    identifier: 'civ:Credential:Identity',
    version: '1',
    depends: [
      'civ:Identity:name',
    ],
    excludes: [
      'civ:Identity:name.middle',
    ],
  },
];

module.exports = definitions;
