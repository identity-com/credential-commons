"use strict";var _interopRequireDefault=require("@babel/runtime/helpers/interopRequireDefault"),_regenerator=_interopRequireDefault(require("@babel/runtime/regenerator")),_asyncToGenerator2=_interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator")),_classCallCheck2=_interopRequireDefault(require("@babel/runtime/helpers/classCallCheck")),_createClass2=_interopRequireDefault(require("@babel/runtime/helpers/createClass")),_inherits2=_interopRequireDefault(require("@babel/runtime/helpers/inherits")),_possibleConstructorReturn2=_interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn")),_getPrototypeOf2=_interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));function _createSuper(a){var b=_isNativeReflectConstruct();return function(){var c,d=(0,_getPrototypeOf2.default)(a);if(b){var e=(0,_getPrototypeOf2.default)(this).constructor;c=Reflect.construct(d,arguments,e)}else c=d.apply(this,arguments);return(0,_possibleConstructorReturn2.default)(this,c)}}function _isNativeReflectConstruct(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(a){return!1}}var _require=require("@identity.com/uca"),BaseUCA=_require.UserCollectableAttribute,_require2=require("../schemas/jsonSchema"),schemaLoader=_require2.schemaLoader,UserCollectableAttribute=function(a){function b(){return(0,_classCallCheck2.default)(this,b),c.apply(this,arguments)}(0,_inherits2.default)(b,a);var c=_createSuper(b);return(0,_createClass2.default)(b,null,[{key:"create",value:function(){var a=(0,_asyncToGenerator2.default)(_regenerator.default.mark(function e(a,c,d){return _regenerator.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,schemaLoader.loadSchemaFromTitle(a);case 2:return e.abrupt("return",new b(a,c,d,schemaLoader.ucaDefinitions));case 3:case"end":return e.stop();}},e)}));return function(){return a.apply(this,arguments)}}()}]),b}(BaseUCA);module.exports={UserCollectableAttribute:UserCollectableAttribute};