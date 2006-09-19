/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Object", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  this._values_ng = {};

  // New property support
  // this.debug("Properties: " + qx.lang.Object.getKeysAsString(this._properties_available_ng));

  var vLocalProps = this.constructor._properties_local_ng;
  var vProto = this.constructor.prototype;

  // Create pseudo methods
  if (vLocalProps)
  {
    for (var i=0,a=vLocalProps,l=a.length; i<l; i++)
    {
      // this.debug("Create propery methods for " + vLocalProps[i]);
      qx.Property.createMethods(vLocalProps[i], vProto);
    }
  }

  // Set default values
  var vProps = this._properties_available_ng;
  var vName, vProp;
  for (vName in vProps)
  {
    vProp = vProps[vName];
    if (vProp.defaultValue != undefined) {
      this["set" + vName.charAt(0).toUpperCase() + vName.substr(1)](vProp.defaultValue);
    }
  }
});

qx.Proto._properties_available_ng = {};

qx.Property.add("id");
