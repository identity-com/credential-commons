// eslint-disable-next-line @typescript-eslint/no-unused-vars
function warn(a: unknown, b = undefined) {
    // eslint-disable-next-line no-console
    console.warn(a);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function info(a: unknown, b = undefined) {
    // eslint-disable-next-line no-console
    console.info(a);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debug(a: unknown, b = undefined) {
    // eslint-disable-next-line no-console
    // console.debug(a); // disabled
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function error(a: unknown, b = undefined) {
    // eslint-disable-next-line no-console
    console.error(a);
}

export = {
    warn,
    info,
    debug,
    error
}