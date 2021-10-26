"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault"),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),_createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass")),_require=require("bitcoinjs-lib"),HDNode=_require.HDNode,ECSignature=_require.ECSignature,MiniCryptoManagerImpl=function(){function a(){(0,_classCallCheck2.default)(this,a),this.KEY_STORAGE={}}return(0,_createClass2.default)(a,[{key:"installKey",value:function(a,b){try{HDNode.fromBase58(b),this.KEY_STORAGE[a]=b}catch(a){throw new Error("Invalid key format: ".concat(a.message))}}},{key:"sign",value:function(a,b){var c=this.KEY_STORAGE[a],d=HDNode.fromBase58(c),e=Buffer.from(b,"hex"),f=d.sign(e),g=f.toDER().toString("hex");return delete this.KEY_STORAGE[a],g}},{key:"verify",value:function(a,b,c){var d=this.KEY_STORAGE[a],e=HDNode.fromBase58(d),f=Buffer.from(b,"hex"),g=Buffer.from(c,"hex"),h=ECSignature.fromDER(g);return delete this.KEY_STORAGE[a],e.verify(f,h)}}]),a}();module.exports=MiniCryptoManagerImpl;