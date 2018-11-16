const isClaimRelated = require('../src/isClaimRelated');

describe('isClaimRelated Tests', () => {
  it('Should validate a claim path against UCA definitions '
    + 'and VC definitions and succeed', (done) => {
    const uca = 'claim-cvc:Document:name-1';
    const claim = 'document.name.givenNames';
    const credential = 'cvc:Credential:GenericDocumentId';
    const validation = isClaimRelated(claim, uca, credential);
    expect(validation).toBeTruthy();
    done();
  });

  it('Should validate a claim path against UCA definitions and VC definitions and '
    + 'succeed returning false for an non existent dependency', (done) => {
    const uca = 'claim-cvc:Contact:phoneNumber-1';
    const claim = 'contact.phoneNumber.number';
    const credential = 'cvc:Credential:GenericDocumentId';
    const validation = isClaimRelated(claim, uca, credential);
    expect(validation).toBeFalsy();
    done();
  });

  it('Should fail validation of a wrong defined uca global identifier', (done) => {
    const target = () => {
      isClaimRelated('document.name.givenNames', 'claim-civ:Identity:error-1', 'cvc:Credential:GenericDocumentId');
    };
    expect(target).toThrow('UCA identifier does not exist');
    done();
  });

  it('Should fail validation of a wrong defined claim path identifier', (done) => {
    const target = () => {
      isClaimRelated('name.error', 'claim-cvc:Document:name-1', 'cvc:Credential:GenericDocumentId');
    };
    expect(target).toThrow('Claim property path does not exist on UCA definitions');
    done();
  });

  it('Should fail validation of a wrong defined credential parent identifier', (done) => {
    const target = () => {
      isClaimRelated('document.name.givenNames', 'claim-cvc:Document:name-1', 'civ:Credential:Generic');
    };
    expect(target).toThrow('Credential identifier does not exist');
    done();
  });
});
