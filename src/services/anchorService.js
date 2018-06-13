
function Anchor(impl) {
  this.impl = impl;

  this.anchor = (label, data, options) => this.impl.anchor(label, data, options);

  this.update = tempAnchor => this.impl.update(tempAnchor);

  return this;
}


module.exports = Anchor;
