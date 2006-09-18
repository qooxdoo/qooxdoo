/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Object", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  // New property support
  this.debug("Properties: " + qx.lang.Object.getKeysAsString(this._newproperties));

});

qx.Proto._newproperties = {};

qx.Property.add("id");
