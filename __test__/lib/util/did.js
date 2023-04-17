const nacl = require('tweetnacl');
const bs58 = require('bs58');
const didUtil = require('lib/did');

// A default sparse DID document
const DID_SPARSE = 'did:sol:localnet:6ffRJDKb3Ve83A9SsJmjyYk5Ef3LXcRkZAT6hXhBBrHf';
// A DID document where the default key has been removed
const DID_WITH_NO_DEFAULT = 'did:sol:localnet:DwZYFeU2fy8JpmxwL8gH3CVqKcbeb2MALyEf1tVyyDAT';
// A controller DID (to be used with DID_CONTROLLED)
const DID_CONTROLLER = 'did:sol:localnet:DY5HzWG9GJGTw3cfkFndMapGGMXpPVBhRe9jEJjX25u9';
// A controlled DID (to be used with DID_CONTROLLER)
const DID_CONTROLLED = 'did:sol:localnet:2McEWrgSX2oU3aEWkJrpGN49kDp3ciKrH5MTi8vvuZpD';

// Holds reference and PK for DID document fixtures
const DOCUMENTS = {};
DOCUMENTS[DID_WITH_NO_DEFAULT] = [
  'sol.did.no_default_key.json',
  '67R6neGjm4L9kdJ4LbqLmgT3UecoHKwSBXh4zQUVRy4HqzxUFBR1uGCHxGoMbr98ACuT9XtKZejfUMvqQdDepUyq',
];
DOCUMENTS[DID_SPARSE] = [
  'sol.did.sparse.json',
  '2yvWghJhJvMY3LLqpwdb3dCoKJiEm2s7TLLHgVKU81bgTnPdqKgSMzvR2qePG9cmGHJkpnwQTyPXTwFzpJ9JSMfw',
];
DOCUMENTS[DID_CONTROLLER] = [
  'sol.did.controller.json',
  'GQqLfmWSkTazpXjDgRGAvVVPqpb4LWjFFsVVBBZ5cMtJQEu47YrG7uyCMsVRequfJ2xrSohzJhKbeC56ivXfn79',
];
DOCUMENTS[DID_CONTROLLED] = [
  'sol.did.controlled.json',
  '4shZPR61QMm4mCyS9EDMmKtPN7K4pZfysKXZ5YX7QDoHFRrHXmU7pECq7VxeQgGm8ih6jrVjynHy6EJx7b5MfZZK',
];

// mocks didUtil.resolve to return local fixtures instead of looking it up
const mockDids = () => {
  didUtil.resolve = jest.fn()
    .mockImplementation((did) => {
      if (!DOCUMENTS[did]) {
        return null;
      }

      // eslint-disable-next-line global-require,import/no-dynamic-require
      return require(`../fixtures/${DOCUMENTS[did][0]}`);
    })
    .bind(didUtil);

  return didUtil;
};

/**
 * Returns a keyPair for one of the above DIDs
 * @param did
 * @returns {nacl.SignKeyPair}
 */
const keyPair = (did) => {
  const pk = DOCUMENTS[did][1];

  return nacl.sign.keyPair.fromSecretKey(bs58.decode(pk));
};

/**
 * Returns the base58 encoded private key for one of the above DIDs
 */
const privateKeyBase58 = did => DOCUMENTS[did][1];

const DID_KEY_SEED = "4f66b355aa7b0980ff901f2295b9c562ac3061be4df86703eb28c612faae6578";

const generateKeypairAndDid = async (type) => {
  const keypair = await type.generate({
    secureRandom: () => Buffer.from(
          DID_KEY_SEED,
          'hex'
      )
  });
  const did = `did:key:${await keypair.fingerprint()}`;

  return {keypair, did};
}

module.exports = {
  DID_WITH_NO_DEFAULT,
  DID_CONTROLLER,
  DID_CONTROLLED,
  DID_SPARSE,
  mockDids,
  keyPair,
  privateKeyBase58,
  generateKeypairAndDid
};
