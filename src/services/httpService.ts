/**
 * A simple node HTTP services
 */
import request, {RequestPromiseOptions} from 'request-promise-native';
import {Request} from 'request';

// uncomment to debug requests
// require('request-debug')(request);

function HttpServiceConstructor(this: { request: (uri: string, options: RequestPromiseOptions) => Promise<Request> }) {
    this.request = async (uri: string, options: RequestPromiseOptions) => {
        return request(uri, options);
    };
    return this;
}

export {
    HttpServiceConstructor
}
