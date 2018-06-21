/**
 * name: 'attgenericId',
 * name: 'attBaseIdentity',
 * name: 'attAddress',
 * @type {*[]}
 */
const definitions = [{
  identifier: 'civ:Credential:CivicBasic',
  version: '1',
  depends: ['civ:Type:Phone', 'civ:Type:Email']
}, {
  identifier: 'civ:Credential:GenericId',
  version: '1',
  depends: ['civ:Type:Address', 'civ:Type:DocumentType', 'civ:Type:Image', 'civ:Identity:DateOfBirth', 'civ:Identity:name', 'civ:Identity:givenName', 'civ:Identity:DateOfIssue', 'civ:Identity:DateOfExpiry']
}, {
  identifier: 'civ:Credential:Address',
  version: '1',
  depends: ['civ:Type:Address']
}];

module.exports = definitions;