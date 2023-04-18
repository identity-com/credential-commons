/* eslint-disable */
import sift from "sift";

const _ = require('lodash');
const {schemaLoader} = require("../schemas/jsonSchema");
const {Claim} = require("../claim/Claim");
const {ClaimModel} = require("../creds/ClaimModel");
const uuidv4 = require('uuid/v4');
const {parseIdentifier} = require("../lib/stringUtils");
import definitions from '../creds/definitions';
import time from "../timeHelper";
import validUrl from 'valid-url';

function validIdentifiers() {
    const vi = _.map(definitions, (d: { identifier: any; }) => d.identifier);
    return vi;
}

function validateEvidence(evidenceItem: any) {
    const requiredFields = [
        'type',
        'verifier',
        'evidenceDocument',
        'subjectPresence',
        'documentPresence',
    ];
    _.forEach(requiredFields, (field: any) => {
        if (!(field in evidenceItem)) {
            throw new Error(`Evidence ${field} is required`);
        }
    });
    // id property is optional, but if present, SHOULD contain a URL
    if (('id' in evidenceItem) && !validUrl.isWebUri(evidenceItem.id)) {
        throw new Error('Evidence id is not a valid URL');
    }
    if (!_.isArray(evidenceItem.type)) {
        throw new Error('Evidence type is not an Array object');
    }
}

function transformMetaConstraint(constraintsMeta: any) {
    const resultConstraints: any[] = [];

    // handle special field constraints.meta.credential
    const constraintsMetaKeys = _.keys(constraintsMeta.meta);
    _.forEach(constraintsMetaKeys, (constraintKey: any) => {
        const constraint = constraintsMeta.meta[constraintKey];
        const siftConstraint = {};
        // handle special field constraints.meta.credential
        if (constraintKey === 'credential') {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            siftConstraint.identifier = constraint;
        } else if (constraint.is) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            siftConstraint[constraintKey] = constraint.is;
        } else {
            throw new Error(`Malformed meta constraint "${constraintKey}": missing the IS`);
        }
        resultConstraints.push(siftConstraint);
    });
    return resultConstraints;
}

function serializeEvidence(evidence: any) {
    const evidenceList = _.isArray(evidence) ? evidence : [evidence];
    return _.map(evidenceList, (evidenceItem: any) => {
        validateEvidence(evidenceItem);
        return {
            id: evidenceItem.id,
            type: evidenceItem.type,
            verifier: evidenceItem.verifier,
            evidenceDocument: evidenceItem.evidenceDocument,
            subjectPresence: evidenceItem.subjectPresence,
            documentPresence: evidenceItem.documentPresence,
        };
    });
}

function transformConstraint(constraints: any) {
    const resultConstraints: any[] = [];

    _.forEach(constraints.claims, (constraint: any) => {
        if (!constraint.path) {
            throw new Error('Malformed contraint: missing PATTH');
        }
        if (!constraint.is) {
            throw new Error('Malformed contraint: missing IS');
        }

        const siftConstraint = {};
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        siftConstraint[constraint.path] = constraint.is;
        resultConstraints.push(siftConstraint);
    });

    return resultConstraints;
}

function transformDate(obj: any) {
    return new Date(obj.year, (obj.month - 1), obj.day).getTime() / 1000;
}

function isDateStructure(obj: any) {
    const objKeys = _.keys(obj);
    if (objKeys.length !== 3) {
        // it has more or less keys the (day, month, year)
        return false;
    }
    return (_.includes(objKeys, 'day') && _.includes(objKeys, 'month') && _.includes(objKeys, 'year'));
}

const convertDeltaToTimestamp = (delta: any) => time.applyDeltaToDate(delta).getTime() / 1000;

const convertTimestampIfString = (obj: any) => (_.isString(obj) ? convertDeltaToTimestamp(obj) : obj);

function getCredentialDefinition(identifier: string, version: number) {
    const definition = _.find(definitions, {identifier});
    if (!definition) {
        throw new Error(`Credential definition for ${identifier} v${version} not found`);
    }
    return definition;
}

export type Evidence = {}

export type CreateParams = {
    /**
     * The identifier for the credential
     */
    identifier: string,
    /**
     * The issuer DID
     */
    issuer: string,
    /**
     * The subject DID
     */
    subject: string,
    /**
     * The expiry date of the credential
     */
    expiry?: Date,
    /**
     * The claims for the credential
     */
    claims: any[],
    /**
     * Evidences for the credential
     */
    evidence?: Evidence[],
    /**
     * Whether or not to validate the credential against a schema
     */
    validate?: boolean,
}


type CredentialSubject = {
    id: string
}

const CREDENTIAL_TYPE = [
    "VerifiableCredential",
    "IdentityCredential"
];

const CREDENTIAL_ID_PREFIX = "http://www.identity.com/credential/"

export class VerifiableCredential {
    public "@context": string[];
    public id?: string;
    public issuer: string;
    public issuanceDate: string;
    public identifier?: string;
    public expirationDate?: string | null;
    public version: number;
    public type: string[];


    public credentialSubject: CredentialSubject;
    public proof?: any;
    private _claimMeta: any[];

    public evidence?: any[];

    public transient: boolean;

    private constructor(
        identifier: string,
        version: number,
        claims: any[],
        issuer: string,
        subject: string,
        expiryDate: Date | undefined,
        evidence?: any[],
        transient?: boolean
    ) {
        this["@context"] = [
            "https://www.w3.org/2018/credentials/v1",
            "https://www.identity.com/credentials/v3"
        ];

        this.id = CREDENTIAL_ID_PREFIX + uuidv4();
        this.issuer = issuer;
        this.issuanceDate = new Date().toISOString();
        this.identifier = identifier;
        this.expirationDate = expiryDate ? expiryDate.toISOString() : null;
        this.transient = transient ? true : false;

        if (evidence) {
            this.evidence = serializeEvidence(evidence);
        }

        if (!_.includes(validIdentifiers(), identifier)) {
            throw new Error(`${identifier} is not defined`);
        }

        this.version = version;

        this.type = CREDENTIAL_TYPE;

        this.credentialSubject = {
            id: subject,
            ...new ClaimModel(claims)
        }

        const issuerClaim = new Claim('cvc:Meta:issuer', issuer);
        const expiryClaim = new Claim('cvc:Meta:expirationDate', expiryDate ? expiryDate.toISOString() : 'null');
        const issuanceDateClaim = new Claim('cvc:Meta:issuanceDate', new Date().toISOString());

        this._claimMeta = [...[issuerClaim, expiryClaim, issuanceDateClaim], ...claims];
    }

    static async create(params: CreateParams) {
        // Load the schema for the credential
        await schemaLoader.loadSchemaFromTitle(params.identifier);

        // Load the meta schema's from a source
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
        await schemaLoader.loadSchemaFromTitle('cvc:Random:node')

        if (!_.includes(validIdentifiers(), params.identifier)) {
            throw new Error(`${params.identifier} is not defined`);
        }

        const parsedIdentifier = parseIdentifier(params.identifier);
        const version = parseInt(parsedIdentifier[4]);
        const definition = getCredentialDefinition(params.identifier, version);

        const credential = new VerifiableCredential(
            params.identifier,
            version,
            params.claims,
            params.issuer,
            params.subject,
            params.expiry,
            params.evidence,
            definition.transient ?? false
        );

        if (params.validate !== false) {
            await schemaLoader.validateSchema(params.identifier, credential.toJSON());
        }

        return credential;
    }

    public getClaimMeta() {
        return this._claimMeta;
    }

    public toJSON() {
        // If including the proof (even null/undefined), the JSON-LD signing fails
        if (this.proof) {
            return {
                "@context": this["@context"],
                id: this.id,
                issuer: this.issuer,
                issuanceDate: this.issuanceDate,
                identifier: this.identifier,
                expirationDate: this.expirationDate,
                // version: this.version,
                type: this.type,
                credentialSubject: this.credentialSubject,
                proof: this.proof
            }
        } else {
            return {
                "@context": this["@context"],
                id: this.id,
                issuer: this.issuer,
                issuanceDate: this.issuanceDate,
                identifier: this.identifier,
                expirationDate: this.expirationDate,
                // version: this.version,
                type: this.type,
                credentialSubject: this.credentialSubject,
            }
        }
    }

    isMatch = (constraints: any) => {
        const claims = _.cloneDeep(this.credentialSubject);
        const siftCompatibleConstraints = transformConstraint(constraints);

        const claimsMatchConstraint = (constraint: any) => {
            const path = _.keys(constraint)[0];
            const pathValue = _.get(claims, path);
            if (isDateStructure(pathValue)) {
                _.set(claims, path, transformDate(pathValue));
                // transforms delta values like "-18y" to a proper timestamp
                _.set(constraint, path, _.mapValues(constraint[path], convertTimestampIfString));
            }
            // The Constraints are ANDed here - if one is false, the entire
            return sift(constraint)([claims]);
        };

        return siftCompatibleConstraints.reduce(
            (matchesAllConstraints, nextConstraint) => matchesAllConstraints && claimsMatchConstraint(nextConstraint),
            true,
        );
    };

    static getAllProperties = async (identifier: string) => {
        await schemaLoader.loadSchemaFromTitle(identifier);

        const vcDefinition = _.find(definitions, {identifier});
        if (vcDefinition) {
            const allProperties = await vcDefinition.depends.reduce(async (prev: any, definition: any) => {
                const prevProps = await prev;
                const claimProps = await Claim.getAllProperties(definition);

                return [...prevProps, ...claimProps];
            }, Promise.resolve([]));

            let excludesProperties = [];
            if (vcDefinition.excludes) {
                excludesProperties = await vcDefinition.excludes.reduce(async (prev: any, definition: any) => {
                    const prevProps = await prev;
                    const claimProps = await Claim.getAllProperties(definition);

                    return [...prevProps, ...claimProps];
                }, Promise.resolve([]));
            }

            return _.difference(allProperties, excludesProperties);
        }
        return null;
    }

    /**
     * isMatchCredentialMeta
     * @param {*} credentialMeta An Object contains only VC meta fields. Other object keys will be ignored.
     * @param {*} constraintsMeta Example:
     * // constraints.meta = {
     * //   "credential": "credential-civ:Credential:CivicBasic-1",
     * //   "issuer": {
     * //     "is": {
     * //       "$eq": "did:ethr:0xaf9482c84De4e2a961B98176C9f295F9b6008BfD"
     * //     }
     * //   }
     * @returns boolean
     */
    static isMatchCredentialMeta(credentialMeta: any, constraintsMeta: any) {
        const siftCompatibleConstraints = transformMetaConstraint(constraintsMeta);

        if (_.isEmpty(siftCompatibleConstraints)) return false;

        const credentialMetaMatchesConstraint = (constraint: any) => sift(constraint)([credentialMeta]);

        return siftCompatibleConstraints.reduce(
            (matchesAllConstraints, nextConstraint) => matchesAllConstraints && credentialMetaMatchesConstraint(nextConstraint),
            true,
        );
    }
}
