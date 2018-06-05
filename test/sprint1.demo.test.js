import VC from '../src/lib/creds/VerifiableCredential';
import { UCA } from '../src/lib/uca/UserCollectableAttribute';

jest.mock('../src/lib/creds/definitions');

describe('interactions with UCA', () => {
  test('Demo', () => {
  // IdR will be able to request specific data base on the well-know identifiers like: 'civ:Identity:name.first',

  // IdR request are resolved on possible credentials that contains the request claim: 'civ:Identity:name.first' => 'civ:Credential:SimpleIdentity'

  // An IdV is selected to create 'civ:Credential:SimpleIdentity' and it defines that 'civ:Identity:name' and 'civ:Identity:DateOfBirth' are required to Verify and Attest

  // Mobile App knows what is 'civ:Identity:name' based on the published schemas

    const civIdentityName = {
      first: 'Joao',
      middle: 'Barbosa',
      last: 'Santos',
    };

    // Mobile App knows what is 'civ:Identity:name' based on the published schemas

    const civIdentityDateOfBirth = {
      day: 20,
      month: 3,
      year: 1978,
    };

    // After collecting User data Mobile construct unique UCA objects bases on user Pii
    // Using the lib created UCA are allway valid and unique

    const nameUca = new UCA.IdentityName(civIdentityName);
    console.log('A constructed civ:Identity:name');
    console.log(JSON.stringify(nameUca, null, 2));

    const dobUca = new UCA('civ:Identity:DateOfBirth', civIdentityDateOfBirth);
    console.log('A constructed civ:Identity:DateOfBirth');
    console.log(JSON.stringify(dobUca, null, 2));

    // Mobile App send the objects for the IdV to verify 

    // IdV execute Pii verification 
    // Using the lib IDV can get Plain values out of an UCA to perform verifications
    console.log('A plain civ:Identity:name value');
    console.log(JSON.stringify(nameUca.getPlainValue(), null, 2));

    console.log('A plain civ:Identity:DateOfBirth value');
    console.log(JSON.stringify(dobUca.getPlainValue(), null, 2));

    // After verifying user data IdV uses the UCA objects to create 'civ:Credential:SimpleIdentity' credentials structure

    const simpleIdentity = new VC('civ:Credential:SimpleIdentity', 'Civic-Identity-Verifier', [nameUca, dobUca], '1');
    console.log('A NOT Anchored civ:Credential:SimpleIdentity instance');
    console.log(JSON.stringify(simpleIdentity, null, 2));

    // IdV send to the mobile the not anchored on the blockchain TO BE DEFINED a temporary signature
    // Mobile verify the credential, not checking the anchor

    // simpleIdentity.verify(LEVELS.proofs);

    // Mobile signs a transactions for the markle root of the credential to create the Atteestation and anchor the credential on the block chain
    // Mobile store the credential (with no anchor first, but updates it later) 

    // Mobile createa filter version of credential
    const filtered = simpleIdentity.filter(['civ:Identity:name.first']);
    console.log('A Filter civ:Credential:SimpleIdentity sharing only civ:Identity:name.first');
    console.log(JSON.stringify(filtered, null, 2));

    // Mobile share filtered credential(s)

    // IdR Verify credetial

    // filtered.verify(LEVELS.blockchain);

    // IdR use Pii
    console.log(`Hello ${filtered.claims.identity.name.first}`);
    console.log(`Your last name is ${filtered.claims.identity.name.last}`);
  });
});
