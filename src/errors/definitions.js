/**
 * Enum for ErrorCodes
 * @readonly
 * @enum { string }
 */
const ErrorCodes = {

  // IDV
  // Manual Review Tool
  /**
   * Reason: Manual Review detected that the provided document is invalid.
   * Troubleshooting: Make sure the provided document is a valid one.
   * English Localized Error Message: "The provided identity document does not seem to be valid."
   */
  ERROR_IDV_MRT_INVALID_DOC: 'error.idv.mrt.invalid.doc',

  /**
   * Reason: Manual Review detected that the provided document is unsupported.
   * Troubleshooting: Make sure the provided document is a valid one.
   * English Localized Error Message: "The provided identity document is not supported."
   */
  ERROR_IDV_MRT_UNSUPPORTED_DOC: 'error.idv.mrt.unsupported.doc',

  /**
   * Reason: Manual Review detected that the provided utility is invalid.
   * Troubleshooting: Make sure the provided utility is a valid one.
   * English Localized Error Message: "The provided utility bill does not seem to be valid."
   */
  ERROR_IDV_MRT_INVALID_UTILITY: 'error.idv.mrt.invalid.utility',

  /**
   * Reason: Manual Review detected that the provided document scan has a low quality resolution.
   * Troubleshooting: Make sure the provided document scan has a good resolution.
   * English Localized Error Message: "The image quality of the provided identity document is insufficient."
   */
  ERROR_IDV_MRT_QUALITY: 'error.idv.mrt.quality',

  /**
   * Reason: Manual Review detected that the provided document is expired.
   * Troubleshooting: Make sure the provided document has a valid date of expiry.
   * English Localized Error Message: "The provided identity document has expired."
   */
  ERROR_IDV_MRT_EXPIRED: 'error.idv.mrt.expired',

  /**
   * Reason: Manual Review detected that the provided document and photo don't have facial similarity
   * Troubleshooting: Make sure the provided document and photo have a good face similarity.
   * English Localized Error Message: "The provided identity document does not seem to match with the your provided facial image."
   */
  ERROR_IDV_MRT_MISMATCH: 'error.idv.mrt.mismatch',

  /**
   * Reason: Manual Review detected that the requirements fail.
   * Troubleshooting: Make sure the provided document do fit the requirements.
   * English Localized Error Message: "The provided identity document is not supported."
   */
  ERROR_IDV_MRT_REQUIREMENTS_FAIL: 'error.idv.mrt.requirements.fail',

  // Validation
  /**
   * Reason: The IDV detected that the provided document is invalid.
   * Troubleshooting: Make sure the provided document is a valid one.
   * English Localized Error Message: "The provided identity document does not seem to be valid."
   */
  ERROR_IDV_VALIDATION_INVALID_DOC: 'error.idv.validation.invalid.doc',

  /**
   * Reason: The IDV detected that the provided document is unsupported.
   * Troubleshooting: Make sure the provided document is a valid one.
   * English Localized Error Message: "The provided identity document is not supported."
   */
  ERROR_IDV_VALIDATION_UNSUPPORTED_DOC: 'error.idv.validation.unsupported.doc',

  /**
   * Reason: The IDV detected that the provided utility is invalid.
   * Troubleshooting: Make sure the provided utility is a valid one.
   * English Localized Error Message: "The provided utility bill does not seem to be valid."
   */
  ERROR_IDV_VALIDATION_INVALID_UTILITY: 'error.idv.validation.invalid.utility',

  /**
   * Reason: The IDV detected that the provided document scan has a low quality resolution.
   * Troubleshooting: Make sure the provided document scan has a good resolution.
   * English Localized Error Message: "The image quality of the provided identity document is insufficient."
   */
  ERROR_IDV_VALIDATION_QUALITY: 'error.idv.validation.quality',

  /**
   * Reason: The IDV detected that the provided document is expired.
   * Troubleshooting: Make sure the provided document has a valid date of expiry.
   * English Localized Error Message: "The provided identity document has expired."
   */
  ERROR_IDV_VALIDATION_EXPIRED: 'error.idv.validation.expired',

  /**
   * Reason: The IDV detected that the provided document and photo don't have facial similarity
   * Troubleshooting: Make sure the provided document and photo have a good face similarity.
   * English Localized Error Message: "The provided identity document does not seem to match with the your provided facial image."
   */
  ERROR_IDV_VALIDATION_MISMATCH: 'error.idv.validation.mismatch',

  /**
   * Reason: The IDV detected that the provided document does not contain the user name.
   * Troubleshooting: Make sure the provided document contains the user name.
   * English Localized Error Message: "The provided identity document does not seem to contain a valid name."
   */
  ERROR_IDV_VALIDATION_MISSING_NAME: 'error.idv.validation.missing.name',

  /**
   * Reason: The IDV detected that the provided document does not contain the user date of birth.
   * Troubleshooting: Make sure the provided document contains the user date of birth.
   * English Localized Error Message: "The provided identity document does not seem to contain a valid date of birth."
   */
  ERROR_IDV_VALIDATION_MISSING_DOB: 'error.idv.validation.missing.dob',

  /**
   * Reason: The IDV detected that the provided document does not contain the issuing country.
   * Troubleshooting: Make sure the provided document contains the issuing country.
   * English Localized Error Message: "The provided identity document does not seem to contain a valid issuing country."
   */
  ERROR_IDV_VALIDATION_MISSING_COUNTRY: 'error.idv.validation.missing.country',

  /**
   * Reason: The IDV detected that the provided document does not contain a valid document type.
   * Troubleshooting: Make sure the provided document contains a valid document type.
   * English Localized Error Message: "The provided identity document is unsupported."
   */
  ERROR_IDV_VALIDATION_MISSING_DOC_TYPE: 'error.idv.validation.missing.doc.type',

  /**
   * Reason: The IDV detected that the requirements fail.
   * Troubleshooting: Make sure the provided document do fit the requirements.
   * English Localized Error Message: "The provided identity document is unsupported."
   */
  ERROR_IDV_VALIDATION_REQUIREMENTS_FAIL: 'error.idv.validation.requirements.fail',

  /**
   * Reason: Missing required property when sending UCAs
   * Troubleshooting: Make sure the provided UCA has all the required properties filled.
   * Look at the UCA definition to make sure you provided all the values.
   * English Localized Error Message: "Technical error: Provided incomplete information."
   */
  ERROR_IDV_UCA_MISSING_PROPERTY: 'error.idv.uca.missing.property',

  /**
   * Reason: UCA has no more retries remaining
   * Troubleshooting: The maximum number of retries has reached.
   * You must request a new credentialRequest and start over again
   * English Localized Error Message: "Technical error: No more information can be submitted."
   */
  ERROR_IDV_UCA_NO_RETRIES: 'error.idv.uca.no.retries',

  /**
   * Reason: The process is in a final status "FAILED","COMPLETED"
   * Troubleshooting: if you got a FINAL state error,
   * you must request a new credentialRequest and start over again
   * English Localized Error Message: "The validation process has already finished."
   */
  ERROR_IDV_PROCESS_HAS_FINAL_STATUS: 'error.idv.process.has.final.status',

  /**
   * Reason: The UCA is in a final status
   * Troubleshooting: Make sure to change the state of a UCA that is not in the final status.
   * you must request a new credentialRequest and start over again
   * English Localized Error Message: "Technical error: No more information can be submitted."
   */
  ERROR_IDV_UCA_HAS_FINAL_STATUS: 'error.idv.uca.has.final.status',

  /**
   * Reason: A UCA of the batch is in a final status
   * Troubleshooting: Make sure to change the state of a UCA that is not in the final status.
   * English Localized Error Message: "Technical error: No more information can be submitted."
   */
  ERROR_IDV_UCA_BATCH_HAS_FINAL_STATUS: 'error.idv.uca.batch.has.final.status',

  /**
   * Reason: The credentialItem is not valid/unknown to the IDV
   * Troubleshooting: Make sure to provide the valid identifier of a credentialItem by checking the plan
   * English Localized Error Message: "The Validator does not issue the requested credential"
   */
  ERROR_IDV_CR_INVALID_CREDENTIAL_ITEM: 'error.idv.cr.invalid.credentialItem',

  /**
   * Reason: The signature could not be verified
   * Troubleshooting: Try to sign again a credential
   * English Localized Error Message: "Technical error: The issued credential cannot be validated."
   */
  ERROR_IDV_CREDENTIAL_INVALID_SIGNATURE: 'error.idv.credential.invalid.signature',

  /**
   * Reason: The credential has already been signed.
   * Troubleshooting: The credential is already signed. You must not sign it again
   * English Localized Error Message: "Technical error: Duplicate Credential signing."
   */
  ERROR_IDV_CR_ALREADY_SIGNED: 'error.idv.cr.already.signed',

  /**
   * Reason: The payload is missing a required property
   * Troubleshooting: Make sure the payload of a credential contains all the required properties.
   * In the error values will be suplied the missing properties
   * English Localized Error Message: "Technical error: Provided incomplete information."
   */
  ERROR_IDV_CR_MISSING_PROPERTY: 'error.idv.cr.missing.property',

  /**
   * Reason: One of the external services required for phone number validation could not be reached (Authy, Twilio )
   * Troubleshooting: Try again later
   * English Localized Error Message: "Technical error: Server Timeout."
   */
  ERROR_IDV_UCA_SERVER: 'error.idv.uca.server',

  /**
   * Reason: thrown if there are no UCAs in the process or if the UCA specified in the event is missing
   * Troubleshooting: Make sure to provide the missing specified UCA
   * English Localized Error Message: "Technical error: Provided incomplete information."
   */
  ERROR_IDV_MISSING_UCA: 'error.idv.missing.uca',

  /**
   * Reason: UCA is in a wrong version
   * Troubleshooting: Make sure you're providing the UCA in the version declared on the plan
   * English Localized Error Message: "Technical error: Provided information in an incompatible version."
   */
  ERROR_IDV_UCA_WRONG_VERSION: 'error.idv.uca.wrong.version',

  /**
   * Reason: Could not find a validation plan for credential item
   * Troubleshooting: Check if you're providing the right validation plan
   * and credential item
   * English Localized Error Message: "Technical error: No validation plan exists for the requested credential."
   */
  ERROR_IDV_MISSING_PLAN: 'error.idv.missing.plan',

  /**
   * Reason: Could not find process with the provided ID
   * Troubleshooting: Check if you're providing the right process id
   * English Localized Error Message: "Technical error: No validation process found."
   */
  ERROR_IDV_MISSING_PROCESS: 'error.idv.missing.process',

  /**
   * Reason: The value specified for a UCA isn't good for the UCA type
   * Troubleshooting: Check the provided UCA value
   * English Localized Error Message: "Technical error: Provided invalid information."
   */
  ERROR_IDV_UCA_BAD_VALUE: 'error.idv.uca.bad.value',

  /**
   * Reason: The UCA doesn't have a status in the data store
   * Troubleshooting: Try again
   * English Localized Error Message: "Technical error: UCA is missing a status."
   */
  ERROR_IDV_UCA_UPDATE_NO_STATUS: 'error.idv.uca.update.no.status',

  /**
   * Reason: Unable to determine if the UCA can be updated, because the process it belongs to has no status
   * Troubleshooting: Try again
   * English Localized Error Message: "Technical error: Validation Process has no status"
   */
  ERROR_IDV_UCA_UPDATE_NO_PROCESS_STATUS: 'error.idv.uca.update.no.process.status',

  /**
   * Reason: An SMS token is received before one is issued
   * Troubleshooting:  Try again
   * English Localized Error Message: "Technical error: SMS Token is not yet valid."
   */
  ERROR_IDV_TOKEN_RECEIVED_BEFORE_ISSUE: 'error.idv.token.received.before.issue',

  // CW ERRORS

  /**
   * Reason: Thrown when CredentialWallet.validateDsr or CredentialWallet.fetch when a DSR is empty or invalid
   * Troubleshooting: Check if the DSR provided is correct and it's not empty
   * English Localized Error Message: "The identity request could not be validated."
   */
  ERROR_CW_DSR_INVALID_SCOPE_REQUEST: 'error.dsr.invalid.scope.request',

  /**
   * Reason: IDV has returned 'Bad request' anwser
   * Troubleshooting: Check if the value of your UCA is correct or your request params
   * English Localized Error Message: "Technical error: An server error occurred."
   */
  ERROR_CW_IDV_INVALID_REQUEST: 'error.cw.idv.request.failed.generic.4XX',

  /**
   * Reason: IDV has returned unexpected error
   * Troubleshooting: Check the attached message
   * English Localized Error Message: "Technical error: An unexpected server error occurred."
   */
  ERROR_CW_IDV_ERROR: 'error.cw.idv.server.failed.generic.5XX',

  /**
   * Reason: CW has returned unexpected error
   * Troubleshooting: Check the attached message
   * English Localized Error Message: "An error occurred."
   */
  ERROR_CW_GENERIC: 'error.generic',

  /**
   * Reason: DSR is missing 'eventURL' attribute
   * Troubleshooting: Provide 'eventURL' attribute
   * English Localized Error Message: "Technical error: Identity Request is missing a callback URL."
   */
  ERROR_CW_DSR_RESPONSE_MISSING_EVENT_URL: 'error.dsr.missing.event.url',

  /**
   * Reason: eventType value is not a valid one
   * Troubleshooting: Make sure you are providing one of the values:
   * CANCELLED, VERIFYING', COMPLETED,
   * English Localized Error Message: "Technical error: Unknown event Type."
   */
  ERROR_CW_DSR_RESPONSE_INVALID_EVENT_TYPE: 'error.dsr.invalid.event.type',

  /**
   * Reason: No clientID found while calling LegacyService.getUploadDetails
   * Troubleshooting: Make sure LegacyService.legacyDeviceRegistration is being called.
   * English Localized Error Message: "Technical error: Unknown ClientId."
   */
  ERROR_CW_CLIENT_ID_NOT_FOUND: 'client.id.not.found',

  /**
   * Reason: No certificate found for UCA while calling LegacyService.getCertificatesFor
   * Troubleshooting: Make sure there is a certificate saved on localStorage, key 'StorageScope.CERTIFICATE',
   * for the related UCA.
   * English Localized Error Message: "Technical error: No certificate found for the Legacy validation."
   */
  ERROR_CW_CERTIFICATE_NOT_FOUND: 'error.certificate.not.found',

  /**
   * Reason: Unparsable certificate for UCA while calling getCertificatesFor
   * Troubleshooting: Make sure there is a valid certificate saved on localStorage, key 'StorageScope.CERTIFICATE',
   * for the related UCA.
   * English Localized Error Message: "Technical error: Cannot read certificate for the Legacy validation."
   */
  ERROR_CW_CERTIFICATE_UNPARSABLE: 'error.certificate.unparsable',

  /**
   * Reason: Invalid operator when tried to 'constructHumanReadableForm'.
   * Troubleshooting: Make sure the operator is one of the listed ones here:
   * @see HumanReadableForm.convertSiftOperator
   * English Localized Error Message: "Technical error: Cannot create i18n version."
   */
  ERROR_CW_WRONG_QUERY_OPERATOR_SCOPE_REQUEST: 'error.dsr.wrong.sift.operator',

  /**
   * Reason: Could not verify credential during build dsr response.
   * Troubleshooting: Unexpected error during verifying credential. Check logs and try again.
   * English Localized Error Message: "A credential could not be verified correctly."
   */
  ERROR_CW_VERIFY_CREDENTIAL: 'error.verify.credential',

  /**
   * Reason: Legacy UCA identifier is not valid.
   * Troubleshooting: must be one of the followings:
   * 'credential-cvc:Email-v1'
   * 'credential-cvc:PhoneNumber-v1'
   * 'credential-cvc:GenericDocumentId-v1'
   * 'credential-cvc:Address-v1'
   * 'credential-cvc:Identity-v1'
   * English Localized Error Message: "The provided information is not supported."
   */
  ERROR_CW_WRONG_UCA_IDENTIFIER: 'error.wrong.uca.identifier',

  /**
   * Reason: Legacy Verifiable Credential identifier is not valid.
   * Troubleshooting: must be one of the followings:
   * 'credential-cvc:Email-v1'
   * 'credential-cvc:PhoneNumber-v1'
   * 'credential-cvc:GenericDocumentId-v1'
   * 'credential-cvc:Address-v1'
   * 'credential-cvc:Identity-v1'
   * English Localized Error Message: "The provided credential is not supported."
   */
  ERROR_CW_WRONG_VC_IDENTIFIER: 'error.wrong.credential.identifier',

  /**
   * Reason: Verifiable Credential Request was not found.
   * Troubleshooting: please check if the provided id is correct.
   * Also, this happens only on 'IdvApiServiceLocal'.
   * Make sure you want to use that implementation or the 'IdvApiService'.
   * You can toggle implementation by setting the flag: disableLegacy = true
   * English Localized Error Message: "Technical error: Existing Credential Request could not be found."
   */
  ERROR_CW_VCR_NOT_FOUND: 'vcr.not.found',

  /**
   * Reason: CredentialRequest is assigned with a wrong status.
   * Troubleshooting: It must be either ACCEPTED or ISSUED.
   * Also, this happens only on 'IdvApiServiceLocal'.
   * Make sure you want to use that implementation or the 'IdvApiService'.
   * You can toggle implementation by setting the flag: disableLegacy = true
   * English Localized Error Message: "Technical error: Existing Credential Request is in an invalid state."
   */
  ERROR_CW_VCR_INVALID_STATE: 'vcr.invalid.state',

  /**
   * Reason: Could not retrieve Credential from a Credential Request.
   * Troubleshooting: Make sure the Credential Request is ready to check its status
   * English Localized Error Message: "Technical error: Cannot retrieve credential."
   */
  ERROR_CW_VCR_INVALID_CREDENTIAL: 'vcr.invalid.credential',

  /**
   * Reason: Provided Credential Request is invalid.
   * Troubleshooting: Make sure the provided Credential Request meets the following rules:
   * - It's not null
   * - Has a 'credentialRequest.idv' attribute
   * - Has a 'credentialItem' attribute
   * - 'credentialItem' attribute has an 'identifier'
   * English Localized Error Message: "Technical error: Credential Request is invalid."
   */
  ERROR_CW_VCR_INVALID_REQUEST: 'vcr.invalid.request',

  /**
   * Reason: idvService.patchSubjectCredentialRequest has returned null Credential Request
   * Troubleshooting: Make sure the provided subject is correct
   * English Localized Error Message: "Cannot issue credential."
   */
  ERROR_CW_VCR_ERROR_PATCH_SIGNED_SUBJECT: 'vcr.error.patch.signed.subject',

  /**
   * Reason: Could not ensure DID extenal key during 'resolveMissingCredentials'
   * Troubleshooting: Check the attached error
   * English Localized Error Message: "Technical error: Cannot resolve Validator Key."
   */
  ERROR_CW_KEY_MANAGER_CANT_ENSURE_KEY: 'key.manager.cant.ensure.key',

  /**
   * Reason: Unexpected error during communication with CW backend
   * Troubleshooting: Check the attached error
   * English Localized Error Message: "Technical error: Network timeout."
   */
  ERROR_CW_NETWORK_GENERIC: 'error.network.generic',

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
