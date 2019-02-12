// These codes are passed in the 'name' value of the error object when the IDV-toolkit
// throws an error
const IDVErrorCodes = {
  ERROR_IDV_UCA_MISSING_PROPERTY: 'error.idv.uca.missing.property',
  ERROR_IDV_UCA_NO_RETRIES: 'error.idv.uca.no.retries',
  ERROR_IDV_PROCESS_HAS_FINAL_STATUS: 'error.idv.process.has.final.status',
  ERROR_IDV_UCA_HAS_FINAL_STATUS: 'error.idv.uca.has.final.status',
  ERROR_IDV_UCA_BATCH_HAS_FINAL_STATUS: 'error.idv.uca.batch.has.final.status',
  ERROR_IDV_CR_INVALID_CREDENTIAL_ITEM: 'error.idv.cr.invalid.credentialItem',
  ERROR_IDV_CREDENTIAL_INVALID_SIGNATURE: 'error.idv.credential.invalid.signature',
  ERROR_IDV_CR_ALREADY_SIGNED: 'error.idv.cr.already.signed',
  ERROR_IDV_CR_MISSING_PROPERTY: 'error.idv.cr.missing.property',
  ERROR_IDV_UCA_SERVER: 'error.idv.uca.server',
};

// these are used in the 'name' property in the array of objects passed as the errorContext
const ErrorContextTypes = {
  MISSING_PROPERTY: 'missing_property',
  UCA_STATE: 'uca_state',
  PROCESS_STATE: 'process_state',
};

/*
* IDVError parses a HTTP Error response body from the IDV-toolkit
* Usage: the IDVError can be instantiated directly from the HTTPResponse body e.g.
* const idvError = new IDVError(response.body);
* @param  errorObj: parsed directly from the HTTP Response body which should contain
*           message: human readable explanation of the error e.g. 'Missing required UCA fields'
*           name: Error-Code, defined in IDVErrorCodes, e.g. IDVErrorCodes.ERROR_IDV_UCA_MISSING_PROPERTY
*           data: an array of objects with { name: "name", value: "value" } properties e.g.
*               [{ name: ErrorContextType.MISSING_PROPERTY, value: missingProperty }]
* @returns an instance of IDVError
* */
class IDVError {
  constructor(errorObj) {
    this.message = errorObj.message;
    this.errorCode = errorObj.name;
    this.errorContext = errorObj.data;
  }
}

module.export = {
  IDVErrorCodes,
  ErrorContextTypes,
  IDVError,
};
