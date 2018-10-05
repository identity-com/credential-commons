"use strict";

/**
 * Abstract Anchor/Attestation service
 * 
 * @param {*} impl 
 */
function Anchor(impl) {
  this.impl = impl;
  this.anchor = (label, data, options) => this.impl.anchor(label, data, options);
  this.update = tempAnchor => this.impl.update(tempAnchor);
  this.verifySignature = subject => this.impl.verifySignature(subject);
  this.verifySubjectSignature = subject => this.impl.verifySubjectSignature(subject);
  this.verifyAttestation = signature => this.impl.verifyAttestation(signature);
  this.revokeAttestation = signature => this.impl.revokeAttestation(signature);
  this.isRevoked = signature => this.impl.isRevoked(signature);
  return this;
}

module.exports = Anchor;