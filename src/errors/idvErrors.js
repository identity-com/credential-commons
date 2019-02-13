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
  ERROR_IDV_MISSING_UCA: 'error.idv.missing.uca',
  ERROR_IDV_UCA_WRONG_VERSION: 'error.idv.uca.wrong.version',
  ERROR_IDV_UCA_INVALID_EVENT: 'error.idv.uca.invalid.event',
  ERROR_IDV_MISSING_PROCESS: 'error.idv.missing.process',
  ERROR_IDV_MISSING_PLAN: 'error.idv.missing.plan',
  ERROR_IDV_UCA_BAD_VALUE: 'error.idv.uca.bad.value',
  ERROR_IDV_UCA_UPDATE_NO_STATUS: 'error.idv.uca.update.no.status',
  ERROR_IDV_UCA_UPDATE_NO_PROCESS_STATUS: 'error.idv.uca.update.no.process.status',
  ERROR_IDV_TOKEN_RECEIVED_BEFORE_ISSUE: 'error.idv.token.received.before.issue',
};

// these are used in the 'name' property in the array of objects passed as the errorContext
const ErrorContextTypes = {
  MISSING_PROPERTY: 'missing_property',
  UCA_STATE: 'uca_state',
  UCA_VALUE: 'uca_value',
  UCA_VERSION: 'uca_version',
  EXPECTED_UCA_VERSION: 'expected_uca_version',
  PROCESS_ID: 'process_id',
  UCA_NAME: 'uca_name',
  UCA_ID: 'uca_id',
  CREDENTIAL_ITEM: 'credential_item',
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
