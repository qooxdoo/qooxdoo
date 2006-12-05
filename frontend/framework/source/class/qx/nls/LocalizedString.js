/**
 * Create a new instance of qx.nls.LocalizedString
 */
qx.OO.defineClass("qx.nls.LocalizedString", qx.core.Object,
function(id, args) {
  qx.core.Object.call(this);
	
  this.setId(id);
  this.setArgs(args);
});


qx.OO.addProperty({ name: "id"});
qx.OO.addProperty({ name: "args"});


qx.Proto.toString = function () {
  return qx.nls.Manager.getInstance().translate(this.getId(), this.getArgs());
}

