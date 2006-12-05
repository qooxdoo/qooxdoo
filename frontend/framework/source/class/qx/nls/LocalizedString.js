/**
 * Create a new instance of qx.nls.LocalizedString
 */
qx.OO.defineClass("qx.nls.LocalizedString", qx.core.Object,
function(id) {
  qx.core.Object.call(this);
	
  this.setId(id);
});


qx.OO.addProperty({ name: "id"});


qx.Proto.toString = function () {
  qx.nls.Manager.getInstance().tr(this.getId());
}