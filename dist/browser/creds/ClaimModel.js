'use strict';var _classCallCheck2=require("babel-runtime/helpers/classCallCheck"),_classCallCheck3=_interopRequireDefault(_classCallCheck2);function _interopRequireDefault(a){return a&&a.__esModule?a:{default:a}}var _=require("lodash"),ClaimModel=function a(b){var c=this;(0,_classCallCheck3.default)(this,a),_.forEach(b,function(a){var b=a.getClaimRootPropertyName();_.isEmpty(b)?c[a.getClaimPropertyName()]=a.getPlainValue():(!c[b]&&(c[b]={}),c[b][a.getClaimPropertyName()]=a.getPlainValue())})};module.exports={ClaimModel:ClaimModel};