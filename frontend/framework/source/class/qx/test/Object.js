/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Object", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  // New property support
  // this.debug("Properties: " + qx.lang.Object.getKeysAsString(this._newproperties));

  // Set default values
  var vProps = this._newproperties;
  var vName;

  for (vName in vProps)
  {
    vProp = vProps[vName];
    if (vProp.defaultValue != undefined) {
      this["set" + vName.charAt(0).toUpperCase() + vName.substr(1)](vProp.defaultValue);
    }
  }
});

qx.Proto._newproperties = {};

qx.Property.add("id");
