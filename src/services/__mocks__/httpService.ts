/* eslint-disable max-len */
import _ from 'lodash'
import logger from '../../logger';

class HttpService {
    private name: string;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: any;

    constructor() {
        this.name = 'mockHttp';
        this.request = async (uri: string, options: object) => {
            logger.debug(`Mocking request for: ${JSON.stringify({uri, options}, null, 2)}`);
            const params = _.isString(uri) ? {url: uri} : uri;
            _.assign(params, options);
            const responses = [
                {
                    path: '/registry',
                    response: {
                        clientID: '6e0ce9b31eb13064a194c1482ed3d9d330f22df6fb4cbcc0dbebf3169dc2325b',
                        xpub: '0469919359510a703516503299c77ef0e00f18255a32db19a3e69636e203f25f29be24b685df9f8a70548751f53a2e4c235ec0fbdc82d0783bd30e315ebfd6bd1e',
                        cas: '{"iv":"TEtgZuJdyJFkgcuHoBC52w==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"gcm","adata":"","cipher":"aes","salt":"SA0z5h6IlfA=","ct":"8h6ys3fD31HsWH3s5rrbF6o54ekJf6owhSJBW6FBIhkftJWSWVWVEt0u0FJFqhCqPaEl+DMM6olH9fAcB7bD7i2DRPjLYiC+"}',
                        sak: {},
                    },
                },
                {
                    path: '/jwt',
                    response: {jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiIyYzdlNjQ4YS1hNDhmLTQxNTgtOGZmMS02MTY0YzM5OWNlNDMiLCJpYXQiOjE1Mjg4MjE1ODUuNDM0LCJleHAiOjE1Mjg4MjE3NjUuNDM0LCJpc3MiOiJodHRwczovL2FwaS5jaXZpYy5jb20vand0IiwiYXVkIjoiQXR0ZXN0ZXJTZXJ2aWNlIiwic3ViIjoiYzhhNjRhODE4NWRlMzNkMTlkZTgwMjFmYmUyMjhkMmE1YTc3YzExMTdkYjc1NDJlZDE0ODM1NGNiZjdkNGVmMSIsImRhdGEiOnsibWV0aG9kIjoiUE9TVCIsInBhdGgiOiJodHRwczovL2Rldi5hcGkuY2l2aWMuY29tL3JlcXVlc3QtYXR0ZXN0YXRpb24tdGJjaC9yZXF1ZXN0QXR0ZXN0YXRpb24ifX0.2Rp8XLTLvzu51raTQRpce8kIiilsMeiPZeWAsuNv5n7hFZGl-ce-fx9DgxsZ0OTaIUgo8frbiGmHjQh0WlUG7A'},
                },
                {
                    path: '/requestAttestation',
                    response: {statusUrl: '/status/372091f0-6e5f-11e8-ab04-8d6f9c9b4e5a'},
                },
                {
                    path: '/requestAttestation',
                    response: {statusUrl: '/status/372091f0-6e5f-11e8-ab04-8d6f9c9b4e5a'},
                },
                {
                    path: '/status',
                    response: {
                        schema: 'dummy-20180201',
                        tx: '01000000018815822815dbd6c355ad47af5d753a00000000fc00473044022042426820da1f2fac328a408d538638143177168b575da66825bc99a3f487472baa0751b67355407b4a4e99da04a3186c520220578b820dd051c919c2fb57b26aa29667483b547f6766a23e3c821e47a5d1237b0147304402201316cc0ee8a968f4d86a616fcf710b663e0bb7021e95d7a300036b65e95ca34602204f05162db06278af2a8abdd7ab4d92e973dc4154a92bf37a4056f3298fa9ecad014c695221028f9205846d9b23dd9a17588ae13603aa3eda3599582750904716c827d02269db210340f8f56a56b2af2a9698f66574882068cf8bd8fa95a26136ac34edabfe5eb5d021029d52d336232eb3d4f37730822df9d3993a84c3edba20f14d3ee0f20141c0bdfd53aeffffffff01551500000000000017a91460312cbbb8ec560305a239d56398f0d8aa57ecf68700000000',
                        subject: {
                            label: 'teste',
                            pub: 'xpub:dummy',
                            data: 'testesdsd',
                            signature: '304502210089e94f11587bf7fa202817ace9664639855a146565d4e54b9f853f31f4d7ce31022077098a904e0dda7ab947db92a3e7dd7a5d52654c286151c3cc97feb0ef4a3310',
                        },
                        authority: {
                            pub: 'xpub:dummy',
                            path: '/',
                        },
                        cosigners: [
                            {
                                pub: 'xpub:dummy',
                            },
                            {
                                pub: 'xpuv:dummy',
                            },
                        ],
                        type: 'temporary',
                        network: 'testnet',
                    },

                },
            ];
            const res = _.find(responses, r => _.includes(params.url, r.path));
            if (res) {
                return Promise.resolve(res.response);
            }
            return Promise.reject();
        };
    }
}

logger.debug('Using Mock HTTP Service');
const http = new HttpService();
http.request('/status').then(console.log); // eslint-disable-line
logger.debug(`HTTP Service instance ${JSON.stringify(http, null, 2)}`);

export = http