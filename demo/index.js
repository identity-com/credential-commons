/* eslint-disable no-console */
// No Logger is required to run this simple DEMO.

const { UCA, VC } = require('../src');

const civIdentityName = {
  first: 'Joao',
  middle: 'Barbosa',
  last: 'Santos',
};


const civIdentityDateOfBirth = {
  day: 20,
  month: 3,
  year: 1978,
};


const nameUca = new UCA.IdentityName(civIdentityName);
console.log('A constructed civ:Identity:name');
console.log(JSON.stringify(nameUca, null, 2));

const dobUca = new UCA('civ:Identity:DateOfBirth', civIdentityDateOfBirth);
console.log('A constructed civ:Identity:DateOfBirth');
console.log(JSON.stringify(dobUca, null, 2));

console.log('A plain civ:Identity:name value');
console.log(JSON.stringify(nameUca.getPlainValue(), null, 2));

console.log('A plain civ:Identity:DateOfBirth value');
console.log(JSON.stringify(dobUca.getPlainValue(), null, 2));


const simpleIdentity = new VC('civ:Credential:Identity', 'Civic-Identity-Verifier', [nameUca], '1');
console.log('A NOT Anchored civ:Credential:SimpleIdentity instance');
console.log(JSON.stringify(simpleIdentity, null, 2));


const filtered = simpleIdentity.filter(['civ:Identity:name.first']);
console.log('A Filter civ:Credential:SimpleIdentity sharing only civ:Identity:name.first');
console.log(JSON.stringify(filtered, null, 2));
