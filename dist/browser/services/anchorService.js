"use strict";function Anchor(a){var b=this;return this.impl=a,this.anchor=function(a,c,d){return b.impl.anchor(a,c,d)},this.update=function(a){return b.impl.update(a)},this.verifySignature=function(a){return b.impl.verifySignature(a)},this.verifySubjectSignature=function(a){return b.impl.verifySubjectSignature(a)},this.verifyAttestation=function(a){return b.impl.verifyAttestation(a)},this.revokeAttestation=function(a){return b.impl.revokeAttestation(a)},this.isRevoked=function(a){return b.impl.isRevoked(a)},this}module.exports=Anchor;