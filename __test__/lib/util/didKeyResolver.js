import { getResolver } from '@transmute/did-key-common';

class DidKeyResolver {
    constructor(type) {
        this.type = type;
    }

    async resolve(did) {
        const keyResolver = getResolver(this.type);

        const document = await keyResolver(did);

        return document.didDocument;
    }
}

module.exports = DidKeyResolver;
