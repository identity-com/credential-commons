/**
 * Convert strings like "SocialSecurity" to "socialSecurity".
 * If passed a non-PascalCase string such as SOCIAL_SECURITY, it cannot detect that the string
 * is not PascalCase and will therefore convert it to sOCIAL_SECURITY
 * @param string
 * @return {*}
 */
const pascalToCamelCase = (string: string) => string.replace(/^([A-Z])/, (match: string) => match.toLowerCase());

const identifierPattern = /(claim|credential|uca|type)-((\w+):[\w.:]+)-v(\d+)/;
const parseIdentifier = (identifier: string) => identifier.match(identifierPattern);

export = {
    pascalToCamelCase,
    parseIdentifier,
};
