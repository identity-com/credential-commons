// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {UserCollectableAttribute as BaseUCA} from '@identity.com/uca'
import {schemaLoader} from '../schemas/jsonSchema';

export class UserCollectableAttribute extends BaseUCA {
    static async create(identifier, value, version) {
        await schemaLoader.loadSchemaFromTitle(identifier);

        return new UserCollectableAttribute(identifier, value, version, schemaLoader.ucaDefinitions);
    }
}