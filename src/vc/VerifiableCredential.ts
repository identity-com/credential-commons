// TODO: Remove this disable as part of IDCOM-2356
/* eslint-disable */
const {schemaLoader} = require("../schemas/jsonSchema");
const {Claim} = require("../claim/Claim");
const {ClaimModel} = require("../creds/ClaimModel");
const uuidv4 = require('uuid/v4');
const {parseIdentifier} = require("../lib/stringUtils");

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
    // private _claimMeta: any[];

    private constructor(
        identifier: string,
        claims: any,
        issuer: string,
        subject: string,
        expiryDate: Date | undefined
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

        const parsedIdentifier = parseIdentifier(identifier);
        this.version = parseInt(parsedIdentifier[4]);

        this.type = CREDENTIAL_TYPE;

        this.credentialSubject = {
            id: subject,
            ...new ClaimModel(claims)
        }

        const issuerClaim = new Claim('cvc:Meta:issuer', issuer);
        const expiryClaim = new Claim('cvc:Meta:expirationDate', expiryDate ? expiryDate.toISOString() : 'null');
        const issuanceDateClaim = new Claim('cvc:Meta:issuanceDate', new Date().toISOString());

        // this._claimMeta = [...[issuerClaim, expiryClaim, issuanceDateClaim], ...claims];
    }

    static async create(params: CreateParams) {
        // Load the schema for the credential
        await schemaLoader.loadSchemaFromTitle(params.identifier);

        // Load the meta schema's from a source
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuer');
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:issuanceDate');
        await schemaLoader.loadSchemaFromTitle('cvc:Meta:expirationDate');
        await schemaLoader.loadSchemaFromTitle('cvc:Random:node')

        return new VerifiableCredential(params.identifier, params.claims, params.issuer, params.subject, params.expiry);
    }

    // public getClaimMeta() {
    //     return this._claimMeta;
    // }

    public toJSON() {
        // If including the proof (even null/undefined), the JSON-LD signing fails
        if(this.proof) {
            return  {
                "@context": this["@context"],
                id: this.id,
                issuer: this.issuer,
                issuanceDate: this.issuanceDate,
                identifier: this.identifier,
                expirationDate: this.expirationDate,
                version: this.version,
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
                version: this.version,
                type: this.type,
                credentialSubject: this.credentialSubject,
            }
        }

    }
}
