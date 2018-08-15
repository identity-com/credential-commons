const isClaimRelated = require('../src/isClaimRelated');

describe('isClaimRelated Tests', () => {
  it('Should validate a claim path against UCA definitions and VC definitions and succeed', (done) => {
    const uca = 'claim-civ:Identity:name-1';
    const claim = 'name.first';
    const credential = 'civ:Credential:GenericId';
    const validation = isClaimRelated(claim, uca, credential);
    expect(validation).toBeTruthy();
    done();
  });

  it('Should validate a claim path against UCA definitions and VC definitions and succeed returning false for an non existent dependency', (done) => {
    const uca = 'claim-civ:Type:phone-1';
    const claim = 'phone.number';
    const credential = 'civ:Credential:GenericId';
    const validation = isClaimRelated(claim, uca, credential);
    expect(validation).toBeFalsy();
    done();
  });

  it('Should fail validation of a wrong defined claim path', (done) => {
    const target = () => {
      isClaimRelated('first', 'claim-civ:Identity:name-1', 'civ:Credential:GenericId');
    };
    expect(target).toThrow('Malformed claim path property');
    done();
  });

  it('Should fail validation of a wrong defined uca global identifier', (done) => {
    const target = () => {
      isClaimRelated('name.first', 'claim-civ:Identity:error-1', 'civ:Credential:GenericId');
    };
    expect(target).toThrow('UCA identifier does not exist');
    done();
  });

  it('Should fail validation of a wrong defined claim path identifier', (done) => {
    const target = () => {
      isClaimRelated('name.error', 'claim-civ:Identity:name-1', 'civ:Credential:GenericId');
    };
    expect(target).toThrow('Claim property path does not exist on UCA definitions');
    done();
  });

  it('Should fail validation of a wrong defined credential parent identifier', (done) => {
    const target = () => {
      isClaimRelated('name.first', 'claim-civ:Identity:name-1', 'civ:Credential:Generic');
    };
    expect(target).toThrow('Credential identifier does not exist');
    done();
  });
});
