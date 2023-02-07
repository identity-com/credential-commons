// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

/**
 * Current Anchor/Attester service
 *
 */
import uuid from 'uuid/v4'
import logger from '../logger'

/**
 * An Anchor/Attester implementation
 *
 * @param {*} config
 * @param {*} http
 */
function DummyAnchorServiceImpl(config, http) {
    this.config = config;
    this.http = http;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const pollService = async (statusUrl) => {
        try {
            const attestation = await this.http.request({
                url: statusUrl,
                method: 'GET',
                simple: true,
                json: true,
            });

            if (!attestation || !attestation.type) {
                // eslint-disable-next-line no-unused-vars
                return await pollService(statusUrl);
            }
            if (attestation && attestation.type !== 'permanent') {
                attestation.statusUrl = statusUrl;
                return attestation;
            }
            return attestation;
        } catch (error) {
            logger.error(`Error polling: ${statusUrl}`, JSON.stringify(error, null, 2));
            throw new Error(`Error polling: ${statusUrl}`);
        }
    };

    this.anchor = async (options = {}) => (
        Promise.resolve({
            subject: {
                pub: 'xpub:dummy',
                label: options.subject && options.subject.label ? options.subject.label : null,
                data: options.subject && options.subject.data ? options.subject.data : null,
                signature: 'signed:dummy',
            },
            walletId: 'none',
            cosigners: [{
                pub: 'xpub:dummy',
            }, {
                pub: 'xpub:dummy',
            }],
            authority: {
                pub: 'xpub:dummy',
                path: '/',
            },
            coin: 'dummycoin',
            tx: new uuid(), // eslint-disable-line
            network: 'dummynet',
            type: 'temporary',
            civicAsPrimary: false,
            schema: 'dummy-20180201',
        })
    );

    this.update = async (tempAnchor) => {
        // eslint-disable-next-line no-param-reassign
        tempAnchor.type = 'permanent';
        // eslint-disable-next-line no-param-reassign
        tempAnchor.value = uuid();
        return Promise.resolve(tempAnchor);
    };

    this.verifySignature = () => true;

    /**
     * This method checks if the subject signature matches the pub key
     * @returns {*} true or false for the validation
     */
    this.verifySubjectSignature = () => true;

    /**
     * This method checks that the attestation / anchor exists on the BC
     */
    this.verifyAttestation = async () => true;

    this.revokeAttestation = async (signature) => {
        // eslint-disable-next-line no-param-reassign
        signature.revoked = true;
        return Promise.resolve(signature);
    };

    this.isRevoked = signature => (signature.revoked ? signature.revoked : false);

    return this;
}

export {
    DummyAnchorServiceImpl as CurrentCivicAnchor
}