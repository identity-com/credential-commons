'use strict';

var path = require('path');
var os = require('os');
var fs = require('fs');

if (process.platform === 'win32') throw new Error('Unsupported platform: ' + process.platform);

var CONFIG_FILE = 'config';

var CONFIG_PATH = {
  BOX: '/etc/civic',
  USER: path.join('' + os.homedir(), '.civic')
};

var userConfigFile = path.join(CONFIG_PATH.USER, CONFIG_FILE);
var boxConfigFile = path.join(CONFIG_PATH.BOX, CONFIG_FILE);

var configFile = fs.existsSync(userConfigFile) ? userConfigFile : boxConfigFile;

/* eslint-disable global-require */
if (fs.existsSync(userConfigFile)) {
  require('dotenv').config({ path: configFile });
}
/* eslint-ebable global-require */

var config = {
  sipSecurityService: process.env.CIVIC_SEC_URL,
  attestationService: process.env.CIVIC_ATTN_URL,
  clientConfig: {
    id: process.env.CIVIC_CLIENT_ID,
    signingKeys: {
      hexpub: process.env.CIVIC_CLIENT_XPUB,
      hexsec: process.env.CIVIC_CLIENT_XPRV
    }
  },
  passphrase: process.env.CIVIC_PASSPHRASE,
  keychain: { prv: process.env.CIVIC_KEYCHAIN }
};

module.exports = config;