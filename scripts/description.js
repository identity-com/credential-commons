const _ = require('lodash');
const ucaDefinitions = require('../src/uca/definitions');

console.log('Attestable Values');
console.log('=================');
console.log('This UCA are used as metadata or internal values not user Pii');
console.log('');

_.forEach(_.filter(ucaDefinitions, { attestable: true }), (def) => {
  console.log(def.identifier);
  console.log(def.description);
});

console.log('');
console.log('Credential Items');
console.log('=================');
console.log('This UCA are used as credential item and represent units of user Pii');
console.log('');

_.forEach(_.filter(ucaDefinitions, { credentialItem: true }), (def) => {
  console.log(def.identifier);
  console.log(def.description);
});

console.log('');
console.log('Types');
console.log('=================');
console.log('This UCA are data collected but not attested');
console.log('');

_.forEach(_.filter(ucaDefinitions, { credentialItem: false }), (def) => {
  console.log(def.identifier);
  console.log(def.description);
});
