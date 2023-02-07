import path from 'path';
import os from 'os';
import fs from 'fs';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {config as dotEnvConfig} from 'dotenv';

const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

if (process.platform === 'win32') throw new Error(`Unsupported platform: ${process.platform}`);

if (process.env.APP_ENV !== 'browser' && !isBrowser) {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dotEnvConfig({
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
    keychain: {prv: process.env.CIVIC_KEYCHAIN},
    accessToken: process.env.CLIENT_ACCESS_TOKEN,
    walletId: process.env.CLIENT_WALLET_ID,
    walletPassphrase: process.env.CLIENT_WALLET_PASSPHRASE,
};

export {
    config
}
