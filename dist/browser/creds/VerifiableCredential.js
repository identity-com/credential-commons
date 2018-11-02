"use strict";var _toConsumableArray2=require("babel-runtime/helpers/toConsumableArray"),_toConsumableArray3=_interopRequireDefault(_toConsumableArray2),_slicedToArray2=require("babel-runtime/helpers/slicedToArray"),_slicedToArray3=_interopRequireDefault(_slicedToArray2),_regenerator=require("babel-runtime/regenerator"),_regenerator2=_interopRequireDefault(_regenerator),_asyncToGenerator2=require("babel-runtime/helpers/asyncToGenerator"),_asyncToGenerator3=_interopRequireDefault(_asyncToGenerator2),_classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2),_createClass2=require("babel-runtime/helpers/createClass"),_createClass3=_interopRequireDefault(_createClass2);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _=require("lodash"),sift=require("sift"),MerkleTools=require("merkle-tools"),sjcl=require("sjcl"),timestamp=require("unix-timestamp"),flatten=require("flat"),uuidv4=require("uuid/v4"),definitions=require("./definitions"),UCA=require("../uca/UserCollectableAttribute"),_require=require("../services"),services=_require.services,anchorService=services.container.AnchorService,secureRandom=services.container.SecureRandom;function sha256(a){return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(a))}function getClaimPath(a,b){var c=_.split(a,":"),d=_.lowerCase(c[1]),e=d+"."+c[2],f=_.find(b,function(a){return _.endsWith(a,e)});return f||e}function validIdentifiers(){var a=_.map(definitions,function(a){return a.identifier});return a}function getClaimsWithFlatKeys(a){var b=flatten(a,{maxDepth:3}),c=flatten(a,{maxDepth:2}),d=_.merge({},b,c),e=_(d).toPairs().sortBy(0).fromPairs().value();return e}function getLeavesClaimPaths(a){return _.map(a,"claimPath")}function verifyLeave(a,b,c,d,e,f,g){var h=new UCA(a.identifier,{attestableValue:a.value});if("String"===h.type||"Number"===h.type)h.value!==_.get(c,a.claimPath)&&e.push(a.value);else if("Object"===h.type){var i=h.value,j=_.get(c,a.claimPath),k=_.keys(h.value);_.each(k,function(a){var b=_.get(i[a],"type"),c="Number"===b?_.padStart(j[a],8,"0"):j[a];c&&_.get(i[a],"value")!==c&&e.push(j[a])})}else e.push(a.value);var l=sha256(a.value);l!==a.targetHash&&f.push(a.targetHash);var m=b.validateProof(a.node,a.targetHash,d.merkleRoot);m||g.push(a.targetHash)}function transformConstraint(a){var b=[];return _.forEach(a.claims,function(a){if(!a.path)throw new Error("Malformed contraint: missing PATTH");if(!a.is)throw new Error("Malformed contraint: missing IS");var c={};c[a.path]=a.is,b.push(c)}),b}var CivicMerkleProof=function(){function a(b,c){(0,_classCallCheck3.default)(this,a);var d=a.padTree(b);this.type="CivicMerkleProof2018",this.merkleRoot=null,this.anchor="TBD (Civic Blockchain Attestation)",this.leaves=a.getAllAttestableValue(d),this.buildMerkleTree(c)}return(0,_createClass3.default)(a,null,[{key:"PADDING_INCREMENTS",get:function(){return 16}}]),(0,_createClass3.default)(a,[{key:"buildMerkleTree",value:function(a){var b=this,c=new MerkleTools,d=_.map(this.leaves,function(a){return sha256(a.value)});c.addLeaves(d),c.makeTree(),_.forEach(d,function(d,e){b.leaves[e].claimPath=getClaimPath(b.leaves[e].identifier,a),b.leaves[e].targetHash=d,b.leaves[e].node=c.getProof(e)}),this.leaves=_.filter(this.leaves,function(a){return"cvc:Random:node"!==a.identifier}),this.merkleRoot=c.getMerkleRoot().toString("hex")}}],[{key:"padTree",value:function(b){for(var c=b.length,d=c<a.PADDING_INCREMENTS?a.PADDING_INCREMENTS:_.ceil(c/a.PADDING_INCREMENTS)*a.PADDING_INCREMENTS,e=_.clone(b);e.length<d;)e.push(new UCA("cvc:Random:node",secureRandom.wordWith(16)));return e}},{key:"getAllAttestableValue",value:function(a){var b=[];return _.forEach(a,function(a){var c=a.getAttestableValues();_.reduce(c,function(a,b){return a.push(b),a},b)}),b}}]),a}(),ClaimModel=function a(b){var c=this;(0,_classCallCheck3.default)(this,a),_.forEach(b,function(a){var b=a.getClaimRootPropertyName();c[b]||(c[b]={}),c[b][a.getClaimPropertyName()]=a.getPlainValue()})},VERIFY_LEVELS={INVALID:-1,PROOFS:0,ANCHOR:1,BLOCKCHAIN:2};function VerifiableCredentialBaseConstructor(a,b,c,d,e){var f=this;this.id=uuidv4(),this.issuer=b;var g=new UCA("cvc:Meta:issuer",this.issuer);this.issuanceDate=new Date().toISOString();var h=new UCA("cvc:Meta:issuanceDate",this.issuanceDate);this.identifier=a,this.expirationDate=c?timestamp.toDate(timestamp.now(c)).toISOString():null;var i=new UCA("cvc:Meta:expirationDate",this.expirationDate?this.expirationDate:"null"),j=i?_.concat(d,g,h,i):_.concat(d,g,h);if(!_.includes(validIdentifiers(),a))throw new Error(a+" is not defined");var k=e?_.find(definitions,{identifier:a,version:""+e}):_.find(definitions,{identifier:a});if(!k)throw new Error("Credential definition for "+a+" v"+e+" not found");if(this.version=""+e||k.version,this.type=["Credential",a],!_.isEmpty(d)){this.claim=new ClaimModel(d);var l=_.keys(flatten(this.claim,{safe:!0}));if(this.proof=new CivicMerkleProof(j,l),!_.isEmpty(k.excludes)){var m=_.remove(this.proof.leaves,function(a){return _.includes(k.excludes,a.identifier)});_.forEach(m,function(a){_.unset(f.claim,a.claimPath)})}}return this.getGlobalCredentialItemIdentifier=function(){return"credential-"+f.identifier+"-"+f.version},this.filter=function(a){var b=_.cloneDeep(f);return _.remove(b.proof.leaves,function(b){return!_.includes(a,b.identifier)}),b.claim={},_.forEach(b.proof.leaves,function(a){_.set(b.claim,a.claimPath,_.get(f.claim,a.claimPath))}),b},this.requestAnchor=function(){var a=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(b){var c;return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,anchorService.anchor(f.identifier,f.proof.merkleRoot,b);case 2:return c=a.sent,f.proof.anchor=c,a.abrupt("return",f);case 5:case"end":return a.stop();}},a,f)}));return function(){return a.apply(this,arguments)}}(),this.updateAnchor=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(){var b;return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.next=2,anchorService.update(f.proof.anchor);case 2:return b=a.sent,f.proof.anchor=b,a.abrupt("return",f);case 5:case"end":return a.stop();}},a,f)})),this.verifyProofs=function(){var a=_.clone(f.expirationDate),b=_.clone(f.claim),c=_.clone(f.proof),d=_.get(c,"leaves"),e=!1,g=new MerkleTools,h=getClaimsWithFlatKeys(b),i=getLeavesClaimPaths(d),j=[],k=[],l=[],m=[],n=[];_.forEach(_.keys(h),function(a){var e=_.indexOf(i,a);if(-1===e){_.findLastIndex(a,".");var f=a.substring(0,_.lastIndexOf(a,"."));if(-1<_.indexOf(i,f))return;j.push(a)}else{var h=d[e];verifyLeave(h,g,b,c,l,m,n)}});var o=_.indexOf(i,"meta.expirationDate");if(0<=o){var p=d[o],q=l.length+m.length+n.length;verifyLeave(p,g,{meta:{expirationDate:a}},c,l,m,n);var r=l.length+m.length+n.length;if(r===q&&null!==a){var s=new Date,t=new Date(a);s.getTime()>t.getTime()&&k.push(a)}}return _.isEmpty(j)&&_.isEmpty(l)&&_.isEmpty(m)&&_.isEmpty(n)&&_.isEmpty(k)&&(e=!0),e},this.verify=function(a){var b=a||VERIFY_LEVELS.PROOFS,c=VERIFY_LEVELS.INVALID;return b>=VERIFY_LEVELS.PROOFS&&f.verifyProofs()&&(c=VERIFY_LEVELS.PROOFS),c},this.verifySignature=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(){return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",anchorService.verifySignature(f.proof));case 1:case"end":return a.stop();}},a,f)})),this.verifyAttestation=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(){return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",anchorService.verifyAttestation(f.proof));case 1:case"end":return a.stop();}},a,f)})),this.revokeAttestation=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(){return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",anchorService.revokeAttestation(f.proof));case 1:case"end":return a.stop();}},a,f)})),this.isRevoked=(0,_asyncToGenerator3.default)(_regenerator2.default.mark(function a(){return _regenerator2.default.wrap(function(a){for(;;)switch(a.prev=a.next){case 0:return a.abrupt("return",anchorService.isRevoked(f.proof));case 1:case"end":return a.stop();}},a,f)})),this.isMatch=function(a){var b=transformConstraint(a),c=!0;return _.forEach(b,function(a){return c=-1<sift.indexOf(a,[f.claim]),c}),c},this}var CREDENTIAL_META_FIELDS=["id","identifier","issuer","issuanceDate","expirationDate","version","type"],getCredentialMeta=function(a){return _.pick(a,CREDENTIAL_META_FIELDS)};function transformMetaConstraint(a){var b={},c=_.get(a,"meta.credential");if(c){var d=/(.*)-(.*)-(.*)/g,e=d.exec(c),f=(0,_slicedToArray3.default)(e,4);b.identifier=f[2],b.version=f[3];var g=getCredentialMeta(a.meta);_.forEach(_.keys(g),function(a){b[a]=g[a].is})}return b}var isMatchCredentialMeta=function(a,b){var c=transformMetaConstraint(b),d=!1;return _.isEmpty(c)||(d=-1<sift.indexOf(c,[a])),d};VerifiableCredentialBaseConstructor.CREDENTIAL_META_FIELDS=CREDENTIAL_META_FIELDS,VerifiableCredentialBaseConstructor.getCredentialMeta=getCredentialMeta,VerifiableCredentialBaseConstructor.isMatchCredentialMeta=isMatchCredentialMeta,VerifiableCredentialBaseConstructor.fromJSON=function(a){var b=new VerifiableCredentialBaseConstructor(a.identifier,a.issuer);return b.id=_.clone(a.id),b.issuanceDate=_.clone(a.issuanceDate),b.expirationDate=_.clone(a.expirationDate),b.identifier=_.clone(a.identifier),b.version=_.clone(a.version),b.type=_.cloneDeep(a.type),b.claim=_.cloneDeep(a.claim),b.proof=_.cloneDeep(a.proof),b},VerifiableCredentialBaseConstructor.getAllProperties=function(a){var b=_.find(definitions,{identifier:a});if(b){var c=[];_.forEach(b.depends,function(a){c.push.apply(c,(0,_toConsumableArray3.default)(UCA.getAllProperties(a)))});var d=[];return _.forEach(b.excludes,function(a){d.push.apply(d,(0,_toConsumableArray3.default)(UCA.getAllProperties(a)))}),_.difference(c,d)}return null},VerifiableCredentialBaseConstructor.VERIFY_LEVELS=VERIFY_LEVELS,module.exports=VerifiableCredentialBaseConstructor;