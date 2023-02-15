// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import traverse from 'json-schema-traverse';
import {definitions as ucaDefinitions} from '@identity.com/uca';
import definitions from '../../claim/definitions'
import credentialDefinitions from '../../creds/definitions'

let summaryMap = {};

/**
 * Code generated to create a sumary map for a human readable output.
 */
class SummaryMapper {
    static addDefinition(def) {
        const textLabel = SummaryMapper.getTextLabel(def.identifier);

        if (textLabel) {
            const mapItem = _.get(summaryMap, textLabel);
            if (mapItem) {
                mapItem.labelFor.push(def.identifier);
            } else {
                summaryMap[textLabel] = {
                    identifier: def.identifier,
                    textLabel,
                    credentials: SummaryMapper.getCredentials(def.identifier),
                    labelFor: [def.identifier],
                    changeable: SummaryMapper.isUpdatable(textLabel),
                    claimPath: SummaryMapper.getClaimPath(def.identifier),
                };
            }
        }
    }

    static addCredentialDefinition(def) {
        const textLabel = SummaryMapper.getTextLabel(def.identifier);

        if (textLabel) {
            summaryMap[textLabel] = {
                identifier: def.identifier,
                textLabel,
                credentials: [def.identifier],
                labelFor: [def.identifier],
                changeable: SummaryMapper.isUpdatable(textLabel),
                claimPath: null,
            };
        }
    }

    static getTextLabel(identifier) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [type, name, version] = _.split(identifier, '-');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [namespace, unique, path] = _.split(name, ':');

        if (type && unique) {
            return `${unique}.${type}${path ? `.${path}` : ''}`.toLowerCase();
        }

        return null;
    }

    static isUpdatable(textLabel) {
        const notUpdatable = [
            'document.placeofbirth.claim',
            'document.dateofbirth.claim',
        ];
        return !_.includes(notUpdatable, textLabel);
    }

    static getCredentials(identifier) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [type, name, version] = _.split(identifier, '-');

        if (type === 'credential') {
            return [identifier];
        }

        const credentials = _.filter(credentialDefinitions, item => _.includes(item.depends, identifier));

        return _.map(credentials, item => item.identifier);
    }

    static getClaimPath(identifier) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [type, name, version] = _.split(identifier, '-');

        if (type === 'credential') {
            return null;
        }

        return SummaryMapper.getPath(identifier);
    }

    static getBaseIdentifiers(identifier) {
        const claimRegex = /claim-cvc:(.*)\.(.*)-v\d*/;
        let isNewIdentifier = true;

        let identifierComponents = claimRegex.exec(identifier);
        if (identifierComponents === null) {
            identifierComponents = _.split(identifier, ':');
            isNewIdentifier = false;
        }
        return {
            identifierComponents,
            isNewIdentifier,
        };
    }

    static getPath(identifier) {
        const {identifierComponents} = SummaryMapper.getBaseIdentifiers(identifier);
        const baseName = _.camelCase(identifierComponents[1]);
        return baseName !== 'type' ? `${baseName}.${identifierComponents[2]}` : identifierComponents[2];
    }
}

const getSchemaVersion = (identifier) => {
    const matches = identifier.match(/-v([\d]+$)/);
    if (matches && matches.length > 1) {
        return matches[1];
    }

    return '1';
};

function transformUcaIdToClaimId(identifier) {
    const identifierComponents = identifier.split(':');
    return `claim-cvc:${identifierComponents[1]}.${identifierComponents[2]}-v1`;
}

function isDefinitionEqual(definition, ucaDefinition) {
    return definition.identifier === transformUcaIdToClaimId(ucaDefinition)
        || definition.identifier === ucaDefinition;
}

const isUCA = uca => /^[^:]+:[^:]+:[^:]+$/.test(uca);

/**
 * This class loads the schema definitions as needed by using loaders provided by the
 */
class SchemaLoader {
    constructor() {
        this.loaders = [];
        this.definitions = definitions;
        this.ucaDefinitions = ucaDefinitions;
        this.credentialDefinitions = credentialDefinitions;
        this.summaryMap = summaryMap;
        this.validIdentifiers = [];
        this.validUcaIdentifiers = [];
        this.validCredentialIdentifiers = [];
        this.ucaCompared = [];

        // allowUnionTypes is required because of the anchor in the proof can be a string/object (this should be changed)
        this.ajv = new Ajv({
            logger: console,
            allErrors: true,
            verbose: true,
            strict: true,
            allowUnionTypes: true,
        });

        // add data formats such as date-time
        addFormats(this.ajv);
        this.ajv.addKeyword('attestable');
        // Needed to add these to support "reversing" definitions back to the previous definitions for backwards
        // compatibilty. These should be removed?
        this.ajv.addKeyword('transient');
        this.ajv.addKeyword('credentialItem');
        this.ajv.addKeyword('alias');
        this.ajv.addKeyword('deambiguify');
    }

    reset() {
        this.ucaDefinitions.length = 0;
        this.definitions.length = 0;
        this.credentialDefinitions.length = 0;
        this.validIdentifiers.length = 0;
        this.validCredentialIdentifiers.length = 0;
        this.validUcaIdentifiers.length = 0;
        this.ajv.removeSchema(/.*/);
        summaryMap = {};
        this.summaryMap = summaryMap;
    }

    /**
     * Adds a schema loader which references where the schemas are loaded from
     */
    addLoader(loader) {
        this.loaders.push(loader);
    }

    async loadSchemaFromUri(uri) {
        const title = uri.split('#')[0].match('[^/]+$', uri);

        const schema = await this.loadSchemaFromTitle(title[0]);

        return schema;
    }

    async loadPropertySchema(schema, definition, ref, property) {
        const propertySchema = await this.loadSchemaFromUri(ref);

        if (propertySchema !== null) {
            definition.depends.push(propertySchema.title);
        }

        const csProperties = await this.getCredentialSubjectProperties(schema);

        if (csProperties.required && csProperties.required.includes(property)) {
            definition.required.push(propertySchema.title);
        }
    }

    /**
     * Supporting both claim and credentialSubject
     * TODO: remove this once backwards compatibility has been removed
     * @param schema
     * @returns {*|(() => Promise<void>)}
     */
    async getCredentialSubjectProperties(schema) {
        const schemaProperties = await this.flattenCredentialSchemaProperties(schema);

        return schemaProperties.credentialSubject ? schemaProperties.credentialSubject : schemaProperties.claim;
    }

    /**
     * Flattens the properties of a schema if there are any referenced schemas
     * @param schema
     * @returns {Promise<*>}
     */
    async flattenCredentialSchemaProperties(schema) {
        let properties = schema.properties ? schema.properties : {};

        if (schema.allOf) {
            const promises = schema.allOf.map(async (allOf) => {
                if (allOf.$ref) {
                    const refSchema = await this.loadSchemaFromUri(allOf.$ref);
                    const refProperties = await this.flattenCredentialSchemaProperties(refSchema);

                    properties = {
                        ...properties,
                        ...refProperties,
                    };
                }

                if (allOf.properties) {
                    properties = {
                        ...properties,
                        ...allOf.properties,
                    };
                }
            });

            await Promise.all(promises);
        }

        return properties;
    }


    /**
     * Adds a claim definition to be backwards compatible with the old schema structure.
     */
    async addDefinition(schema) {
        if (/^credential-/.test(schema.title)) {
            await this.addCredentialDefinition(schema);
        } else {
            await this.addClaimDefinition(schema);
        }
    }

    /**
     * Adds a credential definition to be backwards compatible with the old schema structure.
     */
    async addCredentialDefinition(schema) {
        const definition = {
            identifier: schema.title,
            version: getSchemaVersion(schema.title),
            depends: [],
        };

        if (schema.transient) {
            definition.transient = true;
        }

        const credentialSubjectDefinition = await this.getCredentialSubjectProperties(schema);

        if (credentialSubjectDefinition.required) {
            definition.required = [];
        }

        const references = [];
        _.forEach(credentialSubjectDefinition.properties, (vo) => {
            _.forEach(vo.properties, (vi, ki) => {
                references.push({ref: vo.properties[ki].$ref, property: ki});
            });
        });

        await _.reduce(references, async (promise, value) => {
            await promise;

            return this.loadPropertySchema(schema, definition, value.ref, value.property);
        }, Promise.resolve());

        this.credentialDefinitions.push(definition);
        this.validCredentialIdentifiers.push(definition.identifier);
        SummaryMapper.addCredentialDefinition(definition);
    }

    async shouldAddClaimDefinition(schema) {
        if (isUCA(schema.title)) {
            const transformed = transformUcaIdToClaimId(schema.title);

            if (!this.ucaCompared.includes(schema.title)) {
                await this.loadSchemaFromTitle(transformed);
            }

            this.ucaCompared.push(schema.title);

            let found = false;
            this.definitions.some((definition) => {
                if (isDefinitionEqual(definition, schema.title)) {
                    found = true;
                }
                return found;
            });

            if (found) {
                return false;
            }
        }

        return true;
    }

    async addClaimDefinition(schema) {
        const definition = {
            identifier: schema.title,
            version: getSchemaVersion(schema.title),
            type: await this.findDefinitionType(schema),
        };

        if (definition.type === 'Array') {
            const subSchema = await this.loadSchemaFromUri(schema.items.$ref);

            definition.items = {
                type: subSchema.title,
            };
        }

        ['attestable', 'credentialItem', 'minimum', 'maximum', 'alias', 'description']
            .forEach((property) => {
                if (property in schema) {
                    definition[property] = schema[property];
                }
            });

        if (schema.pattern) {
            // definition.pattern = new RegExp(schema.pattern.substring(1, schema.pattern.length - 1));
            definition.pattern = new RegExp(schema.pattern);
        }

        if (schema.required) {
            definition.type.required = schema.required;
        }

        if (schema.enum) {
            definition.enum = {};
            _.forEach(schema.enum, (value) => {
                definition.enum[value.toUpperCase()] = value;
            });
        }

        if ((await this.shouldAddClaimDefinition(schema))) {
            this.definitions.push(definition);

            this.validIdentifiers.push(schema.title);
        }

        if (isUCA(schema.title)) {
            this.ucaDefinitions.push(definition);

            this.validUcaIdentifiers.push(schema.title);
        }

        SummaryMapper.addDefinition(definition);
    }

    async getPropertyValue(defProperties, property, name) {
        const {deambiguify, items} = property;
        let {type} = property;

        if (type === 'array' || (items && items.$ref)) {
            if (items.$ref) {
                const arraySchema = await this.loadSchemaFromUri(items.$ref);

                type = arraySchema.title;
            } else {
                type = _.capitalize(type);
            }
        }

        if (property.allOf) {
            const schema = await this.loadSchemaFromUri(property.allOf[0].$ref);

            type = schema.title;
        }

        const defProperty = {name, type};
        if (deambiguify) {
            defProperty.deambiguify = deambiguify;
        }
        defProperties.push(defProperty);
    }

    async getPropertyValues(properties) {
        const defProperties = [];

        await _.reduce(properties, async (promise, value, name) => {
            await promise;

            return this.getPropertyValue(defProperties, value, name);
        }, Promise.resolve());

        return {properties: defProperties};
    }

    /**
     * Finds the definition/properties of a schema
     */
    async findDefinitionType(schema) {
        if (schema.allOf) {
            const subSchema = await this.loadSchemaFromUri(schema.allOf[0].$ref);
            if (subSchema == null) {
                return null;
            }

            return subSchema.title;
        }

        if (schema.type === 'object') {
            if (!_.isEmpty(schema.properties)) {
                return this.getPropertyValues(schema.properties);
            }
        }

        if (schema.type === 'array') {
            return 'Array';
        }

        return _.capitalize(schema.type);
    }

    /**
     * Loads a schema, traversing all the subschemas and loading them as well
     */
    async loadSchemaFromTitle(title) {
        const loader = this.findSchemaLoader(title);
        if (loader == null) {
            return null;
        }

        const schemaId = loader.schemaId(title);
        const existingSchema = this.ajv.getSchema(schemaId);

        let schema;
        // If AJV is unaware of the schema, look it up and create it
        if (!existingSchema) {
            schema = await loader.loadSchema(title);
            if (schema === null) {
                return null;
            }

            // Loads all referenced schemas
            const references = [];
            traverse(schema, {
                cb: (currentNode) => {
                    if (currentNode.$ref !== undefined && !currentNode.$ref.startsWith('#')) {
                        // Prevent the same schema loaded multiple times
                        references.push(this.loadSchemaFromUri(currentNode.$ref));
                    }
                },
            });

            await Promise.all(references);

            await this.addDefinition(schema);

            try {
                this.ajv.addSchema(schema);
            } catch (e) {
                // This could only happen if we have a cyclic dependency, or the same ref multiple times in the schema...
            }

            return schema;
        }

        return existingSchema.schema;
    }


    /**
     * Finds the correct schema loader based on the identifier
     */
    findSchemaLoader(identifier) {
        return _.find(this.loaders, loader => loader.valid(identifier));
    }

    /**
     * Validates the schema based on identifier and supplied data.
     */
    async validateSchema(identifier, data) {
        const loader = this.findSchemaLoader(identifier);

        await this.loadSchemaFromTitle(identifier);

        this.validate(loader.schemaId(identifier), data);
    }

    validate(schemaRef, value) {
        const validateSchema = this.ajv.getSchema(schemaRef);

        if (typeof validateSchema === 'undefined') {
            throw new Error(`Invalid schema id: ${schemaRef}`);
        }

        const valid = validateSchema(value);

        if (!valid) {
            _.forEach(validateSchema.errors, (error) => {
                if (error.params && error.params.missingProperty) {
                    throw new Error(`Missing required fields to ${validateSchema.schema.title}`);
                }
            });

            throw new Error(`Invalid value. Errors: ${JSON.stringify(validateSchema.errors, null, 2)}`);
        }
    }
}

const schemaLoader = new SchemaLoader();

export { schemaLoader };