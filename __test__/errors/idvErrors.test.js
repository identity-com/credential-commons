const { IDVErrorCodes } = require('errors/idvErrors');

describe('IDV Errors', () => {
  it('Should have IDV Error Codes', () => {
    expect(IDVErrorCodes).toHaveProperty('ERROR_IDV_UCA_MISSING_PROPERTY');
  });
});
