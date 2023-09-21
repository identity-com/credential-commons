This project uses [npm audit](https://docs.npmjs.com/cli/audit) to scan dependencies for vulnerabilities
and automatically install any compatible updates to vulnerable dependencies.
The security audit is also integrated into the project's CI pipeline via [audit-ci](https://github.com/IBM/audit-ci) command
which fails the build if there is any vulnerability found.
It is possible to ignore specific errors by whitelisting them in [audit-ci config.](./audit-ci.json).

## NPM audit whitelist
Whenever you whitelist a specific advisory it is required to refer it to here and justify the whitelisting.

### Advisories

| #                   | Level    | Module       | Title                       | Explanation                                                                                                                     |
|---------------------|----------|--------------|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| GHSA-2j2x-2gpw-g8fm | critical | flat         | Prototype Pollution         | Flat is on an old version. The new version is an ESM and can be used once the bundler is updated to support ESM rather than CJS |
| GHSA-p8p7-x288-28g6 | moderate | request      | Server-Side Request Forgery | Request is deprecated and should be replaced with Axios or Fetch                                                                |
| GHSA-72xf-g2v4-qvf3 | moderate | tough-cookie | Prototype Pollution         | Used in 'request', which is deprecated and should be replaced with Axios or Fetch                                               |
| GHSA-p9pc-299p-vxgp | moderate | yargs-parser | Prototype Pollution         | Used in dev dependencies only                                                                                                   | 