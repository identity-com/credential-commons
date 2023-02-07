// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash';
import sjcl from 'sjcl';
import {UserCollectableAttribute} from '../uca/UCA';
import {services} from '../services';
import {schemaLoader} from '../schemas/jsonSchema';
import definitions from './definitions';

const {validIdentifiers} = schemaLoader;

const findDefinition = (identifier, version) => (
    version ? _.find(definitions, {identifier, version}) : _.find(definitions, {identifier})
);

const getDefinition = async (identifier, version) => {
    await schemaLoader.loadSchemaFromTitle(identifier);

    return findDefinition(identifier, version);
};

const isArrayAttestableValue = aValue => aValue.indexOf('[') > -1 && aValue.indexOf(']') > -1;

function getBaseIdentifiers(identifier) {
    const claimRegex = /^claim-cvc:(.*)\.(.*)-v\d*$/;
    let isNewIdentifier = true;

    let identifierComponents = claimRegex.exec(identifier);
    if (identifierComponents === null) {
        identifierComponents = _.split(identifier, ':');
        isNewIdentifier = false;
    }
    return {identifierComponents, isNewIdentifier};
}

async function adaptIdentifierIfNeeded(identifier, version) {
    const definition = await getDefinition(identifier, version);
    const resolvedIdentifier = (definition && definition.alias) ? definition.type : identifier;

    const {isNewIdentifier, identifierComponents} = getBaseIdentifiers(resolvedIdentifier);

    const compDefinition = await getDefinition(resolvedIdentifier, version);
    if (!isNewIdentifier && !(compDefinition)) {
        const newIdentifier = `claim-cvc:${identifierComponents[1]}.${identifierComponents[2]}-v1`;
        await schemaLoader.loadSchemaFromTitle(newIdentifier);

        const foundNewIdentifier = _.find(definitions, {identifier: newIdentifier});
        if (foundNewIdentifier) {
            return newIdentifier;
        }
        throw new Error(`${resolvedIdentifier} is not defined`);
    }
    return identifier;
}

class Claim extends UserCollectableAttribute {
    constructor(identifier, value, version) {
        super(identifier, value, version, definitions);
        this.initialize(identifier, value, version);
    }

    static async create(identifier, value, version) {
        const currentIdentifier = await adaptIdentifierIfNeeded(identifier, version);

        if (!value.attestableValue) {
            await schemaLoader.validateSchema(currentIdentifier, value);
        }

        // Load the schema and it's references from a source to be used for validation and defining the schema definitions
        await schemaLoader.loadSchemaFromTitle(currentIdentifier);

        return new Claim(currentIdentifier, value, version);
    }

    initialize(identifier, value, version) {
        super.initialize(identifier, value, version);

        if (!this.salt) {
            const secureRandom = services.container.SecureRandom;
            this.salt = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(secureRandom.wordWith(64)));
        }
    }

    initializeValuesWithArrayItems(identifier, values, version) {
        const definition = findDefinition(this.identifier, this.version);
        const ucaArray = [];

        if (!_.isArray(values)) throw new Error(`Value for ${identifier}-${version} should be an array`);

        _.forEach(values, (value) => {
            const claim = new Claim(_.get(definition, 'items.type'), value);
            ucaArray.push(claim);
        });

        this.value = ucaArray;
    }

    initializeAttestableValue() {
        const {value} = this;
        const definition = findDefinition(this.identifier, this.version);
        const parsedAttestableValue = Claim.parseAttestableValue(value);

        // Trying to construct UCA with a existing attestableValue
        if (parsedAttestableValue.length === 1) {
            // This is a simple attestableValue
            this.timestamp = null;
            this.salt = parsedAttestableValue[0].salt;
            const ucaValue = parsedAttestableValue[0].value;
            this.value = definition.type === 'Array'
                ? _.map(ucaValue, item => new Claim(definition.items.type, {attestableValue: item}))
                : this.value = _.includes(['null', 'undefined'], ucaValue) ? null : ucaValue;
        } else {
            const ucaValue = {};
            for (let i = 0; i < parsedAttestableValue.length; i += 1) {
                const {propertyName} = parsedAttestableValue[i];
                // we have stored only the property name on the urn, so we have to find the UCA definition

                let filteredIdentifier;
                let ucaPropertyName;
                const ucaType = UserCollectableAttribute.resolveType(definition, definitions);
                const ucaDef = ucaType.properties.find(prop => prop.name === propertyName);
                if (ucaDef) {
                    filteredIdentifier = ucaDef.type;
                    ucaPropertyName = propertyName;
                } else {
                    const splitPropertyName = propertyName.split('.');
                    // this property is used to check if the recursion tree has more than an depth
                    const ucaNamespace = splitPropertyName[splitPropertyName.length - 2];
                    const ucaNamespacePascal = ucaNamespace.substring(0, 1).toUpperCase() + ucaNamespace.substring(1);
                    ucaPropertyName = splitPropertyName[splitPropertyName.length - 1];
                    filteredIdentifier = `cvc:${ucaNamespacePascal}:${ucaPropertyName}`;
                }

                // test if definition exists
                const filteredDefinition = definitions.find(def => def.identifier === filteredIdentifier);
                if (!filteredDefinition) {
                    // this must have an claim path with no recursive definition
                    filteredIdentifier = this.findDefinitionByAttestableValue(ucaPropertyName, definition);
                }
                ucaValue[propertyName] = new Claim(filteredIdentifier,
                    {attestableValue: parsedAttestableValue[i].stringValue});
            }
            this.value = ucaValue;
        }
    }

    /* eslint-disable class-methods-use-this */
    getValidIdentifiers() {
        return validIdentifiers;
    }

    static resolveType(definition) {
        return UserCollectableAttribute.resolveType(definition, definitions);
    }

    static parseAttestableArrayValue(value) {
        const splitDots = value.attestableValue.split(':');

        const propertyName = splitDots[1];
        const salt = splitDots[2];
        const attestableValueItems = value.attestableValue
            .substring(value.attestableValue.indexOf('[') + 1, value.attestableValue.indexOf(']') - 1).split(',');
        const parsedArrayItems = _.map(attestableValueItems,
            item => Claim.parseAttestableValue({attestableValue: item}));
        return {
            propertyName, salt, value: parsedArrayItems,
        };
    }

    static parseAttestableValue(value) {
        const values = [];

        if (_.isArray(value.attestableValue)) {
            // Already parsed in a previous recursion
            return value.attestableValue;
        }

        if (isArrayAttestableValue(value.attestableValue)) {
            const arrayValues = Claim.parseAttestableArrayValue(value);
            return [arrayValues];
        }

        // If is not an ArrayValue we parse it now
        const splitPipes = _.split(value.attestableValue, '|');
        const attestableValueRegex = /^urn:(\w+(?:\.\w+)*):(\w+):(.+)/;
        _.each(splitPipes, (stringValue) => {
            const match = attestableValueRegex.exec(stringValue);
            if (match && match.length === 4) {
                const v = {
                    propertyName: match[1],
                    salt: match[2],
                    value: match[3],
                    stringValue,
                };
                values.push(v);
            }
        });
        if (splitPipes.length !== values.length && splitPipes.length !== values.length + 1) {
            throw new Error('Invalid attestableValue');
        }
        return values;
    }

    findDefinitionByAttestableValue(attestableValuePropertyName, rootDefinition) {
        const ucaType = UserCollectableAttribute.resolveType(rootDefinition, definitions);
        for (const property of ucaType.properties) { // eslint-disable-line no-restricted-syntax
            const resolvedDefinition = _.find(definitions, {identifier: property.type});
            resolvedDefinition.type = UserCollectableAttribute.resolveType(resolvedDefinition, definitions);
            if (!resolvedDefinition.type.properties && property.name === attestableValuePropertyName) {
                return property.type;
            }
            if (resolvedDefinition.type.properties) {
                return this.findDefinitionByAttestableValue(attestableValuePropertyName, resolvedDefinition);
            }
        }
        return null;
    }

    getAttestableValue(path, isArrayItem = false) {
        // all UCA properties they have the form of :propertyName or :something.propertyName
        const {identifierComponents} = getBaseIdentifiers(this.identifier);
        let propertyName = identifierComponents[2];

        if (isArrayItem) {
            // we need to supress the root path
            propertyName = null;
        }

        if (path) {
            propertyName = `${path}.${propertyName}`;
        }

        // it was defined that the attestable value would be on the URN type https://tools.ietf.org/html/rfc8141
        if (['String', 'Number', 'Boolean'].indexOf(this.type) >= 0) {
            return `urn:${propertyName}:${this.salt}:${this.value}|`;
        }
        if (this.type === 'Array') {
            const itemsValues = _.reduce(this.value,
                (result, item) => `${result}${item.getAttestableValue(null, true)},`, '');
            return `urn:${propertyName}:${this.salt}:[${itemsValues}]`;
        }
        return _.reduce(_.sortBy(_.keys(this.value)),
            (s, k) => `${s}${this.value[k].getAttestableValue(propertyName)}`, '');
    }

    /**
     * Returns the global CredentialItem of the Credential
     */
    getGlobalIdentifier() {
        return `claim-${this.identifier}-${this.version}`;
    }

    getClaimRootPropertyName() {
        const {identifierComponents} = getBaseIdentifiers(this.identifier);
        return identifierComponents[1].toLowerCase() === 'type' ? '' : _.camelCase(identifierComponents[1]);
    }

    getClaimPropertyName() {
        const {identifierComponents} = getBaseIdentifiers(this.identifier);
        return identifierComponents[2];
    }

    getClaimPath() {
        return Claim.getPath(this.identifier);
    }

    static getPath(identifier) {
        const {identifierComponents} = getBaseIdentifiers(identifier);
        const baseName = _.camelCase(identifierComponents[1]);
        return baseName !== 'type' ? `${baseName}.${identifierComponents[2]}` : identifierComponents[2];
    }

    getAttestableValues(path, isItemArray = false) {
        const joinPaths = (head, tail) => {
            const headComponents = head ? _.split(head, '.') : [];
            let tailComponents = tail ? _.split(tail, '.') : [];
            tailComponents = _.last(headComponents) === _.first(tailComponents) ? tailComponents.splice(1) : tailComponents;
            const newPath = _.join([...headComponents, ...tailComponents], '.');
            return newPath;
        };

        let values = [];
        const def = _.find(definitions, {identifier: this.identifier, version: this.version});
        if (def.credentialItem || def.attestable) {
            const claimPath = joinPaths(path, !isItemArray ? this.getClaimPath() : null);
            values.push({identifier: this.identifier, value: this.getAttestableValue(null, isItemArray), claimPath});
            if (this.type === 'Object') {
                _.forEach(_.keys(this.value), (k) => {
                    const innerValues = this.value[k].getAttestableValues(claimPath);
                    values = _.concat(values, innerValues);
                });
            } else if (this.type === 'Array') {
                _.forEach(this.value, (item, idx) => {
                    values.push(...item.getAttestableValues(`${claimPath}.${idx}`, true));
                });
            }
        }
        return values;
    }

    /**
     * extract the expected Type name for the value when constructing an UCA
     * @param {*} definition
     */
    static getTypeName(definition) {
        if (_.isString(definition.type)) {
            if (_.includes(validIdentifiers, definition.type)) {
                const innerDefinition = _.find(definitions, {identifier: definition.type});
                return this.getTypeName(innerDefinition);
            }

            return definition.type;
        }
        return 'Object';
    }

    static async getAllProperties(identifier, pathName) {
        await schemaLoader.loadSchemaFromTitle(identifier);

        const definition = _.find(definitions, {identifier});
        const properties = [];
        const type = UserCollectableAttribute.resolveType(definition, definitions);
        const typeDefinition = _.isString(type) ? _.find(definitions, {identifier: type}) : definition;

        if (typeDefinition && this.getTypeName(typeDefinition) === 'Object') {
            let typeDefProps;
            if (typeDefinition.type.properties) {
                typeDefProps = typeDefinition.type.properties;
            } else {
                const typeDefDefinition = _.find(definitions, {identifier: typeDefinition.type});
                typeDefProps = UserCollectableAttribute.resolveType(typeDefDefinition, definitions).properties;
            }

            let basePropName;
            const {identifierComponents: baseIdentifierComponents} = getBaseIdentifiers(identifier);
            if (pathName) {
                if (_.includes(pathName, _.lowerCase(baseIdentifierComponents[1]))) {
                    basePropName = `${pathName}`;
                } else {
                    basePropName = `${pathName}.${_.lowerCase(baseIdentifierComponents[1])}.${baseIdentifierComponents[2]}`;
                }
            } else {
                basePropName = `${_.lowerCase(baseIdentifierComponents[1])}.${baseIdentifierComponents[2]}`;
            }

            if (_.includes(['String', 'Number', 'Boolean'], `${typeDefProps.type}`)) {
                // Properties is not an object
                properties.push(`${basePropName}.${typeDefProps.name}`);
            } else {
                const proProperties = await typeDefProps.reduce(async (prev, prop) => {
                    const prevProps = await prev;
                    const {isNewIdentifier} = getBaseIdentifiers(prop.type);
                    const newBasePropName = !isNewIdentifier ? basePropName : `${basePropName}.${prop.name}`;
                    const props = await this.getAllProperties(prop.type, newBasePropName);

                    return [...prevProps, ...props];
                }, Promise.resolve([]));

                properties.push(...proProperties);
            }
        } else if (pathName) {
            const {identifierComponents} = getBaseIdentifiers(definition.identifier);
            let propertiesName;
            if (pathName.indexOf(identifierComponents[2]) >= 0) {
                propertiesName = `${pathName}`;
            } else {
                propertiesName = `${pathName}.${identifierComponents[2]}`;
            }
            properties.push(propertiesName);
        } else {
            const {identifierComponents} = getBaseIdentifiers(identifier);
            const propertiesName = `${_.lowerCase(identifierComponents[1])}.${identifierComponents[2]}`;
            properties.push(propertiesName);
        }
        return properties;
    }
}

function convertIdentifierToClassName(identifier) {
    const {identifierComponents} = getBaseIdentifiers(identifier);
    const baseName = identifierComponents[1];
    const detailName = _.upperFirst(_.camelCase(identifierComponents[2]));
    return `${baseName}${detailName}`;
}

function mixinIdentifiers(UCA) {
    // Extend UCA Semantic
    _.forEach(_.filter(definitions, d => d.credentialItem), (def) => {
        const name = convertIdentifierToClassName(def.identifier);
        const source = {};
        const {identifier} = def;

        function UCAConstructor(value, version) {
            return new Claim(identifier, value, version);
        }

        source[name] = UCAConstructor;
        _.mixin(Claim, source);
    });
    return UCA;
}

export = {Claim: mixinIdentifiers(Claim), definitions, getBaseIdentifiers};
