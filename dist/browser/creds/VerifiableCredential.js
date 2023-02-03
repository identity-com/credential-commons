"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault"),_regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_toConsumableArray2=_interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray")),_defineProperty2=_interopRequireDefault(require("@babel/runtime/helpers/defineProperty")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));function ownKeys(a,b){var c=Object.keys(a);if(Object.getOwnPropertySymbols){var d=Object.getOwnPropertySymbols(a);b&&(d=d.filter(function(b){return Object.getOwnPropertyDescriptor(a,b).enumerable})),c.push.apply(c,d)}return c}function _objectSpread(a){for(var b,c=1;c<arguments.length;c++)b=null==arguments[c]?{}:arguments[c],c%2?ownKeys(Object(b),!0).forEach(function(c){(0,_defineProperty2.default)(a,c,b[c])}):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(b)):ownKeys(Object(b)).forEach(function(c){Object.defineProperty(a,c,Object.getOwnPropertyDescriptor(b,c))});return a}var _=require("lodash"),validUrl=require("valid-url"),sift=require("sift").default,timestamp=require("unix-timestamp"),flatten=require("flat"),uuidv4=require("uuid/v4"),MerkleTools=require("merkle-tools"),_require=require("../lib/crypto"),sha256=_require.sha256,_require2=require("../claim/Claim"),Claim=_require2.Claim,didUtil=require("../lib/did"),definitions=require("./definitions"),_require3=require("../services"),services=_require3.services,time=require("../timeHelper"),_require4=require("./CvcMerkleProof"),CvcMerkleProof=_require4.CvcMerkleProof,_require5=require("./ClaimModel"),ClaimModel=_require5.ClaimModel,_require6=require("../schemas/jsonSchema"),schemaLoader=_require6.schemaLoader,_require7=require("../lib/stringUtils"),parseIdentifier=_require7.parseIdentifier,signerVerifier=require("../lib/signerVerifier"),convertDeltaToTimestamp=function(a){return time.applyDeltaToDate(a).getTime()/1e3};function validIdentifiers(){var a=_.map(definitions,function(a){return a.identifier});return a}function getClaimsWithFlatKeys(a){var b=flatten(a,{maxDepth:3}),c=flatten(a,{maxDepth:2}),d=_.merge({},b,c);return _(d).toPairs().sortBy(0).fromPairs().value()}function getLeavesClaimPaths(a){return _.map(a,"claimPath")}function verifyLeave(a,b,c,d,e,f,g){var h=new Claim(a.identifier,{attestableValue:a.value}),i=_.get(c,a.claimPath);if(i||(i=null),"String"===h.type||"Number"===h.type)h.value!==i&&e.push(a.value);else if("Object"===h.type){var j=h.value,k=i,l=_.last(_.split(a.claimPath,".")),m={};m[l]=k;var n=_.keys(h.value);_.each(n,function(a){var b=_.get(m,a);b&&"".concat(_.get(j[a],"value"))!=="".concat(b)&&e.push(m[a])})}else if("Array"===h.type){var o=i;_.forEach(h.value,function(a,b){var c=o[b],d=_.keys(a.value);_.each(d,function(b){var d=_.get(c,b);d&&"".concat(_.get(a.value,[b,"value"]))!=="".concat(d)&&e.push(c[b])})})}else e.push(a.value);var p=sha256(a.value);p!==a.targetHash&&f.push(a.targetHash);var q=b.validateProof(a.node,a.targetHash,d.merkleRoot);q||g.push(a.targetHash)}function validateEvidence(a){if(_.forEach(["type","verifier","evidenceDocument","subjectPresence","documentPresence"],function(b){if(!(b in a))throw new Error("Evidence ".concat(b," is required"))}),"id"in a&&!validUrl.isWebUri(a.id))throw new Error("Evidence id is not a valid URL");if(!_.isArray(a.type))throw new Error("Evidence type is not an Array object")}function serializeEvidence(a){var b=_.isArray(a)?a:[a];return _.map(b,function(a){return validateEvidence(a),{id:a.id,type:a.type,verifier:a.verifier,evidenceDocument:a.evidenceDocument,subjectPresence:a.subjectPresence,documentPresence:a.documentPresence}})}function transformConstraint(a){var b=[];return _.forEach(a.claims,function(a){if(!a.path)throw new Error("Malformed contraint: missing PATTH");if(!a.is)throw new Error("Malformed contraint: missing IS");var c={};c[a.path]=a.is,b.push(c)}),b}function isDateStructure(a){var b=_.keys(a);return!(3!==b.length)&&_.includes(b,"day")&&_.includes(b,"month")&&_.includes(b,"year")}function nonCryptographicallySecureVerify(){return _nonCryptographicallySecureVerify.apply(this,arguments)}function _nonCryptographicallySecureVerify(){return _nonCryptographicallySecureVerify=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function b(a){var c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v;return _regenerator.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:return b.next=2,schemaLoader.loadSchemaFromTitle("cvc:Meta:expirationDate");case 2:return b.next=4,schemaLoader.loadSchemaFromTitle(a.identifier);case 4:return c=_.clone(a.expirationDate),d=_.clone(a.credentialSubject),e=_.clone(a.proof),f=_.get(e,"leaves"),g=!1,h=new MerkleTools,i=getClaimsWithFlatKeys(d),j=getLeavesClaimPaths(f),k=[],l=[],m=[],n=[],o=[],_.forEach(_.keys(i).filter(function(a){return"id"!==a}),function(a){var b=_.indexOf(j,a);if(-1===b){_.findLastIndex(a,".");var c=a.substring(0,_.lastIndexOf(a,"."));if(-1<_.indexOf(j,c))return;k.push(a)}else{var g=f[b];verifyLeave(g,h,d,e,m,n,o)}}),p=_.indexOf(j,"meta.expirationDate"),0<=p&&(q=f[p],r={meta:{expirationDate:c}},s=m.length+n.length+o.length,verifyLeave(q,h,r,e,m,n,o),t=m.length+n.length+o.length,t===s&&null!==c&&(u=new Date,v=new Date(c),u.getTime()>v.getTime()&&l.push(c))),_.isEmpty(k)&&_.isEmpty(m)&&_.isEmpty(n)&&_.isEmpty(o)&&_.isEmpty(l)&&(g=!0),b.abrupt("return",g);case 22:case"end":return b.stop();}},b)})),_nonCryptographicallySecureVerify.apply(this,arguments)}function cryptographicallySecureVerify(){return _cryptographicallySecureVerify.apply(this,arguments)}function _cryptographicallySecureVerify(){return _cryptographicallySecureVerify=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function d(a,b,c){var e,f,g;return _regenerator.default.wrap(function(d){for(;;)switch(d.prev=d.next){case 0:return d.next=2,nonCryptographicallySecureVerify(a);case 2:if(e=d.sent,e){d.next=5;break}return d.abrupt("return",!1);case 5:if(!b){d.next=11;break}return d.next=8,b(a.proof);case 8:if(f=d.sent,f){d.next=11;break}return d.abrupt("return",!1);case 11:if(!c){d.next=17;break}return d.next=14,c(a.proof);case 14:if(g=d.sent,g){d.next=17;break}return d.abrupt("return",!1);case 17:return d.abrupt("return",!0);case 18:case"end":return d.stop();}},d)})),_cryptographicallySecureVerify.apply(this,arguments)}function requesterGrantVerify(){return _requesterGrantVerify.apply(this,arguments)}function _requesterGrantVerify(){return _requesterGrantVerify=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function e(a,b,c,d){var f,g,h,i,j,k,l;return _regenerator.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(f=_.get(a.proof,"anchor.subject.label"),g=_.get(a.proof,"anchor.subject.pub"),h=_.get(a.proof,"anchor.subject.data"),!(_.isEmpty(a.proof.granted)||_.isEmpty(f)||_.isEmpty(g))){e.next=5;break}return e.abrupt("return",!1);case 5:if(i="".concat(f).concat(h).concat(b).concat(c),j=sha256(i),k=services.container.CryptoManager,l=d,!_.isEmpty(l)){e.next=14;break}if(_.isFunction(k.installKey)){e.next=12;break}throw new Error("CryptoManager does not support installKey, please use a `keyName` instead.");case 12:l="TEMP_KEY_NAME_".concat(new Date().getTime()),k.installKey(l,g);case 14:return e.abrupt("return",k.verify(l,j,a.proof.granted));case 15:case"end":return e.stop();}},e)})),_requesterGrantVerify.apply(this,arguments)}function transformDate(a){return new Date(a.year,a.month-1,a.day).getTime()/1e3}var VERIFY_LEVELS={INVALID:-1,PROOFS:0,ANCHOR:1,GRANTED:2,BLOCKCHAIN:3};function verifyRequiredClaims(a,b){if(!_.isEmpty(a.required)){var c=b.map(function(a){return a.identifier}),d=_.difference(a.required,c);if(!_.isEmpty(d))throw new Error("Missing required claim(s): ".concat(_.join(d,", ")))}}function getCredentialDefinition(a,b){var c=_.find(definitions,{identifier:a});if(!c)throw new Error("Credential definition for ".concat(a," v").concat(b," not found"));return c}function VerifiableCredentialBaseConstructor(a,b,c,d,e,f,g){var h=this,i=parseIdentifier(a),j=i?i[4]:"1";this.id=uuidv4(),this.issuer=b;var k=new Claim("cvc:Meta:issuer",this.issuer);this.issuanceDate=new Date().toISOString();var l=new Claim("cvc:Meta:issuanceDate",this.issuanceDate);this.identifier=a,this.expirationDate=c?timestamp.toDate(timestamp.now(c)).toISOString():null;var m=new Claim("cvc:Meta:expirationDate",this.expirationDate?this.expirationDate:"null"),n=m?_.concat(e,k,l,m):_.concat(e,k,l);if(!_.includes(validIdentifiers(),a))throw new Error("".concat(a," is not defined"));var o=getCredentialDefinition(a,j);if(this.type=["VerifiableCredential","IdentityCredential"],this.transient=o.transient||!1,f&&(this.evidence=serializeEvidence(f)),this.credentialSubject={id:d},!_.isEmpty(e)&&(verifyRequiredClaims(o,e),this.credentialSubject=_objectSpread(_objectSpread({},this.credentialSubject),new ClaimModel(e)),this.proof=new CvcMerkleProof(n,g?g.signer:null),!_.isEmpty(o.excludes))){var p=_.remove(this.proof.leaves,function(a){return _.includes(o.excludes,a.identifier)});_.forEach(p,function(a){_.unset(h.credentialSubject,a.claimPath)})}this.getGlobalIdentifier=function(){return"credential-".concat(h.identifier,"-").concat(j)},this.filter=function(a){var b=_.cloneDeep(h);return _.remove(b.proof.leaves,function(b){return!_.includes(a,b.identifier)}),b.credentialSubject={},_.forEach(b.proof.leaves,function(a){_.set(b.credentialSubject,a.claimPath,_.get(h.credentialSubject,a.claimPath))}),b},this.requestAnchor=function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function b(a){var c,d,e;return _regenerator.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:if(!h.transient){b.next=3;break}return h.proof.anchor={type:"transient",subject:{label:h.identifier,data:h.proof.merkleRoot}},b.abrupt("return",h);case 3:return c=services.container.AnchorService,d=_.merge({},a,{subject:{label:h.identifier,data:h.proof.merkleRoot}}),b.next=7,c.anchor(d);case 7:return e=b.sent,h.proof.anchor=e,b.abrupt("return",h);case 10:case"end":return b.stop();}},b)}));return function(){return a.apply(this,arguments)}}(),this.updateAnchor=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function a(){var b,c;return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if(!h.transient){a.next=3;break}return h.proof.anchor={type:"transient",subject:{label:h.identifier,data:h.proof.merkleRoot}},a.abrupt("return",h);case 3:return b=services.container.AnchorService,a.next=6,b.update(h.proof.anchor);case 6:return c=a.sent,h.proof.anchor=c,a.abrupt("return",h);case 9:case"end":return a.stop();}},a)})),this.verifyProofs=function(){return nonCryptographicallySecureVerify(h)},this.verify=function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function c(a,b){var d,e,f,g,i,j;return _regenerator.default.wrap(function(c){for(;;)switch(c.prev=c.next){case 0:if(d=b||{},e=d.requestorId,f=d.requestId,g=d.keyName,i=_.isNil(a)?VERIFY_LEVELS.GRANTED:a,j=VERIFY_LEVELS.INVALID,c.t0=j===VERIFY_LEVELS.INVALID&&i>=VERIFY_LEVELS.PROOFS,!c.t0){c.next=8;break}return c.next=7,h.verifyProofs();case 7:c.t0=c.sent;case 8:if(!c.t0){c.next=10;break}j=VERIFY_LEVELS.PROOFS;case 10:return j===VERIFY_LEVELS.PROOFS&&i>=VERIFY_LEVELS.ANCHOR&&h.verifyAttestation()&&(j=VERIFY_LEVELS.ANCHOR),j===VERIFY_LEVELS.ANCHOR&&i>=VERIFY_LEVELS.GRANTED&&h.verifyGrant(e,f,g)&&(j=VERIFY_LEVELS.GRANTED),c.abrupt("return",j);case 13:case"end":return c.stop();}},c)}));return function(){return a.apply(this,arguments)}}(),this.verifyAnchorSignature=function(a){return"transient"===h.proof.anchor.type||services.container.AnchorService.verifySignature(h.proof,a)},this.verifyMerkletreeSignature=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function a(){var b;return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,signerVerifier.verifier(h.issuer,h.proof.merkleRootSignature.verificationMethod);case 2:return b=a.sent,a.abrupt("return",b.verify(h));case 4:case"end":return a.stop();}},a)})),this.verifyAttestation=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function a(){return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("transient"!==h.proof.anchor.type&&"dummynet"!==h.proof.anchor.network){a.next=2;break}return a.abrupt("return",!0);case 2:return a.abrupt("return",services.container.AnchorService.verifyAttestation(h.proof));case 3:case"end":return a.stop();}},a)})),this.revokeAttestation=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function a(){return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("transient"!==h.proof.type){a.next=2;break}return a.abrupt("return");case 2:return a.abrupt("return",services.container.AnchorService.revokeAttestation(h.proof));case 3:case"end":return a.stop();}},a)})),this.isRevoked=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function a(){return _regenerator.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:if("transient"!==h.proof.type){a.next=2;break}return a.abrupt("return",!1);case 2:return a.abrupt("return",services.container.AnchorService.isRevoked(h.proof));case 3:case"end":return a.stop();}},a)}));var q=function(a){return _.isString(a)?convertDeltaToTimestamp(a):a};return this.isMatch=function(a){var b=_.cloneDeep(h.credentialSubject),c=transformConstraint(a),d=function(a){var c=_.keys(a)[0],d=_.get(b,c);return isDateStructure(d)&&(_.set(b,c,transformDate(d)),_.set(a,c,_.mapValues(a[c],q))),sift(a)([b])};return c.reduce(function(a,b){return a&&d(b)},!0)},this.grantUsageFor=function(a,b,c){var d=c.keyName,e=c.pvtKey;if(_.isEmpty(_.get(h.proof,"anchor.subject.label"))||_.isEmpty(_.get(h.proof,"anchor.subject.data")))throw new Error("Invalid credential attestation/anchor");if(!h.verifyAnchorSignature())throw new Error("Invalid credential attestation/anchor signature");if(!a||!b||!(d||e))throw new Error("Missing required parameter: requestorId, requestId or key");var f="".concat(h.proof.anchor.subject.label).concat(h.proof.anchor.subject.data).concat(a).concat(b),g=sha256(f),i=services.container.CryptoManager,j=d;if(e){if(!_.isFunction(i.installKey))throw new Error("You provide a `pvtKey` but the CryptoManager does not support it, use a `keyName` instead.");j="TEMP_KEY_NAME_".concat(new Date().getTime()),i.installKey(j,e)}var k=i.sign(j,g);h.proof.granted=k},this.toJSON=function(){var a=_.pick(h,["id","identifier","issuer","issuanceDate","expirationDate","type","credentialSubject","proof"]);for(var b in a)(null===a[b]||void 0===a[b])&&delete a[b];return _objectSpread({"@context":["https://www.w3.org/2018/credentials/v1","https://www.identity.com/credentials/v".concat(j)]},a)},this.verifyGrant=function(a,b,c){return requesterGrantVerify(h,a,b,c)},this}var CREDENTIAL_META_FIELDS=["id","identifier","issuer","issuanceDate","expirationDate","type"],getCredentialMeta=function(a){return _.pick(a,CREDENTIAL_META_FIELDS)};function transformMetaConstraint(a){var b=[],c=_.keys(a.meta);return _.forEach(c,function(c){var d=a.meta[c],e={};if("credential"===c)e.identifier=d;else if(d.is)e[c]=d.is;else throw new Error("Malformed meta constraint \"".concat(c,"\": missing the IS"));b.push(e)}),b}var isMatchCredentialMeta=function(a,b){var c=transformMetaConstraint(b);if(_.isEmpty(c))return!1;var d=function(b){return sift(b)([a])};return c.reduce(function(a,b){return a&&d(b)},!0)};VerifiableCredentialBaseConstructor.CREDENTIAL_META_FIELDS=CREDENTIAL_META_FIELDS,VerifiableCredentialBaseConstructor.getCredentialMeta=getCredentialMeta,VerifiableCredentialBaseConstructor.isMatchCredentialMeta=isMatchCredentialMeta,VerifiableCredentialBaseConstructor.create=function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function g(a,b,c,d,e,f){var h,i,j,k,l=arguments;return _regenerator.default.wrap(function(g){for(;;)switch(g.prev=g.next){case 0:return h=6<l.length&&void 0!==l[6]?l[6]:null,i=!(7<l.length&&void 0!==l[7])||l[7],g.next=4,schemaLoader.loadSchemaFromTitle(a);case 4:return g.next=6,schemaLoader.loadSchemaFromTitle("cvc:Meta:issuer");case 6:return g.next=8,schemaLoader.loadSchemaFromTitle("cvc:Meta:issuanceDate");case 8:return g.next=10,schemaLoader.loadSchemaFromTitle("cvc:Meta:expirationDate");case 10:return g.next=12,schemaLoader.loadSchemaFromTitle("cvc:Random:node");case 12:if(!h){g.next=21;break}return g.next=15,didUtil.canSign(b,h.verificationMethod);case 15:if(j=g.sent,j){g.next=18;break}throw new Error("The verificationMethod ".concat(h.verificationMethod," is not allowed to sign for ").concat(b));case 18:return g.next=20,signerVerifier.signer(h);case 20:h.signer=g.sent;case 21:if(k=new VerifiableCredentialBaseConstructor(a,b,c,d,e,f,h),!i){g.next=25;break}return g.next=25,schemaLoader.validateSchema(a,k.toJSON());case 25:return g.abrupt("return",k);case 26:case"end":return g.stop();}},g)}));return function(){return a.apply(this,arguments)}}(),VerifiableCredentialBaseConstructor.fromJSON=function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function b(a){var c,d,e=arguments;return _regenerator.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:return c=!!(1<e.length&&void 0!==e[1])&&e[1],b.next=3,schemaLoader.loadSchemaFromTitle(a.identifier);case 3:if(c){b.next=6;break}return b.next=6,schemaLoader.validateSchema(a.identifier,a);case 6:return b.next=8,VerifiableCredentialBaseConstructor.create(a.identifier,a.issuer);case 8:return d=b.sent,d.id=_.clone(a.id),d.issuanceDate=_.clone(a.issuanceDate),d.expirationDate=_.clone(a.expirationDate),d.identifier=_.clone(a.identifier),d.type=_.cloneDeep(a.type),d.credentialSubject=_.cloneDeep(a.credentialSubject),d.proof=_.cloneDeep(a.proof),b.abrupt("return",d);case 17:case"end":return b.stop();}},b)}));return function(){return a.apply(this,arguments)}}(),VerifiableCredentialBaseConstructor.getAllProperties=function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function b(a){var c,d,e;return _regenerator.default.wrap(function(b){for(;;)switch(b.prev=b.next){case 0:return b.next=2,schemaLoader.loadSchemaFromTitle(a);case 2:if(c=_.find(definitions,{identifier:a}),!c){b.next=13;break}return b.next=6,c.depends.reduce(function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function c(a,b){var d,e;return _regenerator.default.wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return c.next=2,a;case 2:return d=c.sent,c.next=5,Claim.getAllProperties(b);case 5:return e=c.sent,c.abrupt("return",[].concat((0,_toConsumableArray2.default)(d),(0,_toConsumableArray2.default)(e)));case 7:case"end":return c.stop();}},c)}));return function(){return a.apply(this,arguments)}}(),Promise.resolve([]));case 6:if(d=b.sent,e=[],!c.excludes){b.next=12;break}return b.next=11,c.excludes.reduce(function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function c(a,b){var d,e;return _regenerator.default.wrap(function(c){for(;;)switch(c.prev=c.next){case 0:return c.next=2,a;case 2:return d=c.sent,c.next=5,Claim.getAllProperties(b);case 5:return e=c.sent,c.abrupt("return",[].concat((0,_toConsumableArray2.default)(d),(0,_toConsumableArray2.default)(e)));case 7:case"end":return c.stop();}},c)}));return function(){return a.apply(this,arguments)}}(),Promise.resolve([]));case 11:e=b.sent;case 12:return b.abrupt("return",_.difference(d,e));case 13:return b.abrupt("return",null);case 14:case"end":return b.stop();}},b)}));return function(){return a.apply(this,arguments)}}(),VerifiableCredentialBaseConstructor.VERIFY_LEVELS=VERIFY_LEVELS,VerifiableCredentialBaseConstructor.nonCryptographicallySecureVerify=nonCryptographicallySecureVerify,VerifiableCredentialBaseConstructor.cryptographicallySecureVerify=cryptographicallySecureVerify,VerifiableCredentialBaseConstructor.requesterGrantVerify=requesterGrantVerify,module.exports=VerifiableCredentialBaseConstructor;