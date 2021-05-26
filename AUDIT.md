This project uses [npm audit](https://docs.npmjs.com/cli/audit) to scan dependencies for vulnerabilities
and automatically install any compatible updates to vulnerable dependencies.
The security audit is also integrated into the project's CI pipeline via [audit-ci](https://github.com/IBM/audit-ci) command
which fails the build if there is any vulnerability found.
It is possible to ignore specific errors by whitelisting them in [audit-ci config.](./audit-ci.json).

## NPM audit whitelist
Whenever you whitelist a specific advisory it is required to refer it to here and justify the whitelisting.

### Advisories

| #    | Level | Module | Title | Explanation |
|------|-------|---------|------|-------------|
| 565 | Moderate | npm>ssri | Regular Expression Denial of Service | dev dependency only |
| 786 | Low | babel-cli > chokidar > anymatch > micromatch > braces | Regular Expression Denial of Service | dev dependency only |
| 1500 | Low | babel-minify>yargs-parser | Prototype Pollution | dev dependency only |
| 1654 | Moderate | npm>libnpx>y18n | Regular Expression Denial of Service | dev dependency only |
| 1677 | Moderate | npm>hosted-git-info | Regular Expression Denial of Service | dev dependency only |
