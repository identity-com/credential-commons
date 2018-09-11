const ucaDefinitions = require('./uca/definitions');
const vcDefinitions = require('./creds/definitions');

/**
 * Validate an claim path against it's parent UCA, and the parent UCA against the dependencies of an Credential
 * @param claim path, eg: name.first
 * @param uca the global identifier for the UCA/Claim, eg: claim-civ:Identity:name-1
 * @param credential the parent identifier, eg: civ:Credential:GenericId
 * @return true if the dependency exists and false if it doesn't
 */
function isClaimRelated(claim, uca, credential) {
  // first get the UCA identifier
  const ucaIdentifier = uca.substring(uca.indexOf('-') + 1, uca.lastIndexOf('-'));
  // check on the credential commons if this identifier exists
  const ucaDefinition = ucaDefinitions.find(definition => definition.identifier === ucaIdentifier);
  // does the claim exists in the UCA?
  if (ucaDefinition) {
    if (claim.indexOf('.') === -1) {
      throw new Error('Malformed claim path property');
    }
    // get the property on claim path
    const property = claim.substring(claim.indexOf('.') + 1);
    const claimUcaIdentifier = `${ucaIdentifier}.${property}`;
    const claimUcaDefinition = ucaDefinitions.find(definition => definition.identifier === claimUcaIdentifier);
    if (claimUcaDefinition) {
      // we now have the composite uca, the uca for the claim property, they both are correct
      // we need to check now the UCA is inside the dependencies of the credential refered as parent
      const credentialDefinition = vcDefinitions.find(definition => definition.identifier === credential);
      if (credentialDefinition) {
        return credentialDefinition.depends.includes(ucaIdentifier);
      }
      throw new Error('Credential identifier does not exist');
    } else {
      throw new Error('Claim property path does not exist on UCA definitions');
    }
  } else {
    // return error about wrong uca identifier
    throw new Error('UCA identifier does not exist');
  }
}

module.exports = isClaimRelated;