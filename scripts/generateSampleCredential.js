const VC = require('../dist/ts-generated/creds/VerifiableCredential');
const UCA = require('../src/uca/UserCollectableAttribute');

const generateSampleBasicCredentials = async () => {
  const email = {
    username: 'savio',
    domain: {
      name: 'gmail',
      tld: 'com',
    },
  };
  const emailUca = new UCA('claim-cvc:Contact.email-v1', email);

  const phoneNumber = {
    country: 'BR',
    countryCode: '55',
    number: '31999998888',
    lineType: 'mobile',
  };

  const phoneNumberUca = new UCA('claim-cvc:Contact.phoneNumber-v1', phoneNumber);

  const emailCredential = new VC('cvc:Credential:Email', 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD', null, [emailUca], 1);
  const emailCredentialTemporary = await emailCredential.requestAnchor();
  const emailCredentialDefinitive = await emailCredentialTemporary.updateAnchor();
  console.log(JSON.stringify(emailCredentialDefinitive, null, 2));

  const phoneNumberCredential = new VC('cvc:Credential:PhoneNumber', 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD', null, [phoneNumberUca], 1);
  const phoneNumberCredentialTemporary = await phoneNumberCredential.requestAnchor();
  const phoneNumberCredentialDefinitive = await phoneNumberCredentialTemporary.updateAnchor();
  console.log(JSON.stringify(phoneNumberCredentialDefinitive, null, 2));
};

const generateSampleAddress = async () => {
  const address = {
    street: 'Alameda dos Anjos',
    unit: '500',
    city: 'Belo Horizonte',
    postalCode: '94103345',
    state: 'Minas Gerais',
    county: 'Sao Bento',
    country: 'Brazil',
  };
  const addressUca = new UCA('claim-cvc:Identity.address-v1', address);
  const civicAddress = new VC('cvc:Credential:Address', 'did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD', 315569260 /* 10y */, [addressUca], 1);
  civicAddress.requestAnchor().then((updatedCredential) => {
    updatedCredential.updateAnchor().then((definitive) => {
      console.log(JSON.stringify(definitive, null, 2));
    });
  });
};

const main = async () => {
  console.log('---------------------------------------------------');
  await generateSampleBasicCredentials();
  console.log('---------------------------------------------------');
  await generateSampleAddress();
};

main().then(() => console.log('DONE')).catch(err => console.error(err));
