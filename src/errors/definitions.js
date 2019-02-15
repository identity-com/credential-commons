/**
 * Enum for ErrorCodes
 * @readonly
 * @enum { string }
 */
const ErrorCodes = {
  // IDV
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

  // CW ERRORS
  ERROR_CW_GENERIC: 'error.generic',
  ERROR_CW_UNHANDLED: 'error.unhandled',
  ERROR_CW_NO_USER_IDENTIFIER: 'error.state.no.user.identifier',
  ERROR_CW_CONTEXT_UNRECOGNIZED: 'error.context.unrecognized',
  ERROR_CW_UNRECOGNIZED_RESPONSE: 'error.server.unrecognized.response',
  ERROR_CW_SERVER_UNABLE_TO_REQUEST_AUTHORIZATION: 'error.server.unable.to.request.authorization',
  ERROR_CW_NETWORK_GENERIC: 'error.network.generic',
  ERROR_CW_NETWORK_TIMEOUT: 'error.network.timeout',
  ERROR_CW_USER_MANAGEMENT_INVALID_MNEMONIC: 'error.user.management.invalid.mnemonic',
  ERROR_CW_DSR_ERROR_FETCHING_SCOPE_REQUEST: 'error.dsr.fetching.scope.request',
  ERROR_CW_DSR_INVALID_SCOPE_REQUEST: 'error.dsr.invalid.scope.request',
  ERROR_CW_DSR_RESPONSE_MISSING_EVENT_URL: 'error.dsr.missing.event.url',
  ERROR_CW_DSR_RESPONSE_INVALID_EVENT_TYPE: 'error.dsr.invalid.event.type',
  ERROR_CW_CLIENT_ID_NOT_FOUND: 'client.id.not.found',
  ERROR_CW_CERTIFICATE_NOT_FOUND: 'error.certificate.not.found',
  ERROR_CW_CERTIFICATE_UNPARSABLE: 'error.certificate.unparsable',
  ERROR_CW_WRONG_QUERY_OPERATOR_SCOPE_REQUEST: 'error.dsr.wrong.sift.operator',
  ERROR_CW_WRONG_VC_IDENTIFIER: 'error.wrong.credential.identifier',
  ERROR_CW_VCR_NOT_FOUND: 'vcr.not.found',
  ERROR_CW_VCR_NOT_AVAILABLE: 'vcr.not.available',
  ERROR_CW_VCR_INVALID_STATE: 'vcr.invalid.state',
  ERROR_CW_VCR_INVALID_CREDENTIAL: 'vcr.invalid.credential',
  ERROR_CW_VCR_INVALID_REQUEST: 'vcr.invalid.request',
  ERROR_CW_VCR_ERROR_PATCH_SIGNED_SUBJECT: 'vcr.error.patch.signed.subject',
  ERROR_CW_KEY_MANAGER_CANT_ENSURE_KEY: 'key.manager.cant.ensure.key',
};

/**
 * Enum for ErrorContextTypes
 * @readonly
 * @enum { string }
 */
const ErrorContextTypes = {
  MISSING_PROPERTY: 'missing_property',
  UCA_STATE: 'uca_state',
  UCA_VALUE: 'uca_value',
  UCA_VERSION: 'uca_version',
  PLAN_UCA_VERSION: 'plan_uca_version',
  PROCESS_ID: 'process_id',
  UCA_NAME: 'uca_name',
  UCA_ID: 'uca_id',
  CREDENTIAL_ITEM: 'credential_item',
  UCA_ERROR: 'uca_error',
};

module.exports = {
  ErrorCodes,
  ErrorContextTypes,
};
