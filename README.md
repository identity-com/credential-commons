# Verifiable Credential and Attestation Library

[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]

Verifiable Credential and Attestation Library - CCS-38

## Prerequisites

[![node][node]][node-url]
[![npm][npm]][npm-url]
      
- [Node.js](http://es6-features.org)

## Features

- [Webpack](https://webpack.js.org/guides) 
    - [Webpack Dev Server](https://github.com/webpack/webpack-dev-server) 
    - [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement)
    - [Clean Webpack Plugin](https://github.com/johnagan/clean-webpack-plugin) 
- [ECMAScript 6](http://es6-features.org)
- [Babel](https://babeljs.io/docs/setup/#installation) 
- [ESLint](https://eslint.org/docs/user-guide/getting-started) 
- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) 

## Start Dev Server

1. `git clone https://github.com/civicteam/civic-credentials-commons-js
2. Run `npm install`
3. Start the dev server using `npm start`
3. Open [http://localhost:9000](http://localhost:9000)


## Commands

- `npm start` - start the dev server
- `npm run build` - create build in `dist` folder
- `npm run lint` - run an ESLint check
- `npm run coverage` - run code coverage and generate report in the `coverage` folder
- `npm test` - run all tests
- `npm run test:watch` - run all tests in watch mode


[npm]: https://img.shields.io/badge/npm-5.3.0-blue.svg
[npm-url]: https://npmjs.com/

[node]: https://img.shields.io/node/v/webpack-es6-boilerplate.svg
[node-url]: https://nodejs.org

[tests]: http://img.shields.io/travis/jluccisano/webpack-es6-boilerplate.svg
[tests-url]: 

[cover]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/jluccisano/webpack-es6-boilerplate
