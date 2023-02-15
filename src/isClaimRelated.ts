// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash';
import {schemaLoader} from './schemas/jsonSchema'
import {definitions, Claim} from './claim/Claim';
import vcDefinitions from './creds/definitions';

/**
 * Validate an claim path against it's parent UserCollectableAttribute, and the parent Claim against the
 * dependencies of an Credential
 * @param claim path, eg: name.first
 * @param uca the global identifier for the UCA/Claim, eg: claim-civ:Identity:name-1
 * @param credential the parent identifier, eg: civ:Credential:GenericId
 * @return true if the dependency exists and false if it doesn't
 */
async function isClaimRelated(claim, uca, credential) {
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    await schemaLoader.loadSchemaFromTitle(claim);
    await schemaLoader.loadSchemaFromTitle(uca);
    await schemaLoader.loadSchemaFromTitle(credential);

    // first get the UCA identifier
    const ucaIdentifier = uca.substring(uca.indexOf('-') + 1, uca.lastIndexOf('-'));
    // Load the schema and it's references from a source to be used for validation and defining the schema definitions
    await schemaLoader.loadSchemaFromTitle(ucaIdentifier);

    // check on the credential commons if this identifier exists
    const ucaDefinition = definitions.find(definition => definition.identifier === ucaIdentifier);
    // does the UCA exist?
    if (ucaDefinition) {
        const ucaProperties = await Claim.getAllProperties(ucaIdentifier);

        // does the claim exists in the Claim?
        if (_.includes(ucaProperties, claim)) {
            // we now have the composite uca, the uca for the claim property, they both are correct
            // we need to check now the UCA is inside the dependencies of the credential refered as parent
            const credentialDefinition = vcDefinitions.find(definition => (
                definition.identifier === credential
            ));
            if (credentialDefinition) {
                return _.includes(credentialDefinition.depends, ucaIdentifier);
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

export = isClaimRelated;