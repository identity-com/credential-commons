"use strict";

/**
 * Abstract Anchor/Attestation service
 * 
 * @param {*} impl 
 */
function Anchor(impl) {
  var _this = this;

  this.impl = impl;

  this.anchor = function (label, data, options) {
    return _this.impl.anchor(label, data, options);
  };

  this.update = function (tempAnchor) {
    return _this.impl.update(tempAnchor);
  };

  return this;
}

module.exports = Anchor;