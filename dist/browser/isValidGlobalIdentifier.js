'use strict';var _=require("lodash"),_require=require("@identity.com/uca"),definitions=_require.definitions,vcDefinitions=require("./creds/definitions"),claimDefinitions=require("./claim/definitions"),validUCAIdentifiers=_.map(definitions,function(a){return a.identifier}),validClaimIdentifiers=_.map(claimDefinitions,function(a){return a.identifier}),validVCIdentifiers=_.map(vcDefinitions,function(a){return a.identifier}),validPrefixes=["claim","credential"];function isValidGlobalIdentifier(a){var b=_.split(a,"-");if(3!==b.length)throw new Error("Malformed Global Identifier");if(!_.includes(validPrefixes,b[0]))throw new Error("Invalid Global Identifier Prefix");switch(b[0]){case"claim":if(!_.includes(validUCAIdentifiers,b[1])&&!_.includes(validClaimIdentifiers,a))throw new Error(a+" is not valid");return!0;case"credential":if(!_.includes(validVCIdentifiers,b[1])&&!_.includes(validVCIdentifiers,a))throw new Error(a+" is not valid");return!0;default:return!1;}}module.exports=isValidGlobalIdentifier;