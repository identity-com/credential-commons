const path = require('path');
const os = require('os');
const fs = require('fs');

if (process.platform === 'win32') throw new Error(`Unsupported platform: ${process.platform}`);

if (process.env.APP_ENV !== 'browser') {
  const CONFIG_FILE = 'config';

  const CONFIG_PATH = {
    BOX: '/etc/civic',
    USER: path.join(`${os.homedir()}`, '.civic'),
  };

  const userConfigFile = path.join(CONFIG_PATH.USER, CONFIG_FILE);
  const boxConfigFile = path.join(CONFIG_PATH.BOX, CONFIG_FILE);

  const configFile = fs.existsSync(userConfigFile) ? userConfigFile : boxConfigFile;

  /* eslint-disable global-require */
  if (fs.existsSync(userConfigFile)) {
    require('dotenv').config({
      path: configFile,
    });
  }
  /* eslint-ebable global-require */
}

const config = {
  sipSecurityService: process.env.CIVIC_SEC_URL,
  attestationService: process.env.CIVIC_ATTN_URL,
  clientConfig: {
    id: process.env.CIVIC_CLIENT_ID,
    signingKeys: {
      hexpub: process.env.CIVIC_CLIENT_XPUB,
      hexsec: process.env.CIVIC_CLIENT_XPRV,
    },
  },
  passphrase: process.env.CIVIC_PASSPHRASE,
  keychain: { prv: process.env.CIVIC_KEYCHAIN },
  accessToken: process.env.CLIENT_ACCESS_TOKEN,
  walletId: process.env.CLIENT_WALLET_ID,
  walletPassphrase: process.env.CLIENT_WALLET_PASSPHRASE,
};

console.log(config);

module.exports = config;
