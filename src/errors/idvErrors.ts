import _ from 'lodash';
import {ErrorCodes, ErrorContextTypes} from './definitions';

// These codes are passed in the 'name' value of the error object when the IDV-toolkit
// throws an error
// @deprecated - left here for retrofit, use ErrorConstants instead for future versions
const IDVErrorCodes = _.pickBy(ErrorCodes, (v, k) => (k.startsWith('ERROR_IDV')));

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
    private message: string;
    private errorCode: string;
    private errorContext: string;

    constructor(errorObj: { message: string; name: string; data: string; }) {
        this.message = errorObj.message;
        this.errorCode = errorObj.name;
        this.errorContext = errorObj.data;
    }
}

export = {
    IDVErrorCodes,
    ErrorContextTypes,
    IDVError,
};
