// TODO: Remove this ts-nocheck after filling in types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {Claim} from './claim/Claim';
import {UserCollectableAttribute} from './uca/UCA';
import VC from './creds/VerifiableCredential';
import {initServices, services} from './services';
import isValidGlobalIdentifier from './isValidGlobalIdentifier';
import errors from './errors/index';
import isClaimRelated from './isClaimRelated';
import claimDefinitions from './claim/definitions';
import constants from './constants/index';
import credentialDefinitions from './creds/definitions';
import aggregate from './AggregationHandler';
import {schemaLoader} from './schemas/jsonSchema';
import CVCSchemaLoader from './schemas/jsonSchema/loaders/cvc';
import VCCompat from './creds/VerifiableCredentialProxy';

/**
 * Entry Point for Civic Credential Commons
 * @returns {CredentialCommons}
 * @constructor
 */
function CredentialCommons() {
    this.Claim = Claim;

    this.init = initServices;
    this.isValidGlobalIdentifier = isValidGlobalIdentifier;
    this.isClaimRelated = isClaimRelated;
    this.services = services;
    this.aggregate = aggregate;
    this.errors = errors;
    this.constants = constants;
    this.claimDefinitions = claimDefinitions;
    this.credentialDefinitions = credentialDefinitions;
    this.schemaLoader = schemaLoader;
    this.CVCSchemaLoader = CVCSchemaLoader;
    this.UserCollectableAttribute = UserCollectableAttribute;
    this.VC = VC;
    this.VCCompat = VCCompat;
    return this;
}

// to work with entry points in multi module manage the best way
export = new CredentialCommons();
