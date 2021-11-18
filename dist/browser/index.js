"use strict";var _require=require("./claim/Claim"),Claim=_require.Claim,_require2=require("./uca/UCA"),UserCollectableAttribute=_require2.UserCollectableAttribute,VC=require("./creds/VerifiableCredential"),_require3=require("./services/index"),initServices=_require3.initServices,services=_require3.services,isValidGlobalIdentifier=require("./isValidGlobalIdentifier"),isClaimRelated=require("./isClaimRelated"),errors=require("./errors"),constants=require("./constants"),claimDefinitions=require("./claim/definitions"),credentialDefinitions=require("./creds/definitions"),aggregate=require("./AggregationHandler"),_require4=require("./schemas/jsonSchema"),schemaLoader=_require4.schemaLoader,CVCSchemaLoader=require("./schemas/jsonSchema/loaders/cvc");function CredentialCommons(){return this.Claim=Claim,this.VC=VC,this.init=initServices,this.isValidGlobalIdentifier=isValidGlobalIdentifier,this.isClaimRelated=isClaimRelated,this.services=services,this.aggregate=aggregate,this.errors=errors,this.constants=constants,this.claimDefinitions=claimDefinitions,this.credentialDefinitions=credentialDefinitions,this.schemaLoader=schemaLoader,this.CVCSchemaLoader=CVCSchemaLoader,this.UserCollectableAttribute=UserCollectableAttribute,this}module.exports=new CredentialCommons;