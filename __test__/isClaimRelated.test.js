const isClaimRelated = require('isClaimRelated');
const { schemaLoader, CVCSchemaLoader } = require('index');

jest.setTimeout(30000);

describe('isClaimRelated Tests', () => {
  beforeAll(() => {
    schemaLoader.addLoader(new CVCSchemaLoader());
  });

  beforeEach(() => {
    schemaLoader.reset();
  });

  it('Should validate a claim path against UCA definitions '
    + 'and VC definitions and succeed', async (done) => {
    const uca = 'claim-claim-cvc:Document.name-v1-1';
    const claim = 'document.name.givenNames';
    const credential = 'credential-cvc:GenericDocumentId-v1';
    const validation = await isClaimRelated(claim, uca, credential);
    expect(validation).toBeTruthy();
    done();
  });

  it('Should validate a claim path against UCA definitions and VC definitions and '
    + 'succeed returning false for an non existent dependency', async (done) => {
    const uca = 'claim-claim-cvc:Contact.phoneNumber-v1-1';
    const claim = 'contact.phoneNumber.number';
    const credential = 'credential-cvc:GenericDocumentId-v1';
    const validation = await isClaimRelated(claim, uca, credential);
    expect(validation).toBeFalsy();
    done();
  });

  it('Should fail validation of a wrong defined uca global identifier', () => expect(isClaimRelated(
    'document.name.givenNames', 'claim-civ:Identity:error-1', 'credential-cvc:GenericDocumentId-v1',
  )).rejects.toThrow(/UCA identifier does not exist/));


  it('Should fail validation of a wrong defined claim path identifier', () => expect(isClaimRelated(
    'name.error', 'claim-claim-cvc:Document.name-v1-1', 'credential-cvc:GenericDocumentId-v1',
  )).rejects.toThrow(/Claim property path does not exist on UCA definitions/));

  it('Should fail validation of a wrong defined credential parent identifier',
    () => expect(isClaimRelated(
      'document.name.givenNames', 'claim-claim-cvc:Document.name-v1-1', 'civ:Credential:Generic',
    )).rejects.toThrow(/Credential identifier does not exist/));
});
