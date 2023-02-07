import sjcl from 'sjcl';

export const sha256 = (stringToHash: string) => sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(stringToHash));