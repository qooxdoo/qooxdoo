/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Object", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  this._newvalues = {};

  // New property support
  // this.debug("Properties: " + qx.lang.Object.getKeysAsString(this._newproperties));

  var vLocalProps = this.constructor._localProperties;
  var vProto = this.constructor.prototype;

  // Create methods
  if (vLocalProps)
  {
    for (var i=0,a=vLocalProps,l=a.length; i<l; i++)
    {
      // this.debug("Create propery methods for " + vLocalProps[i]);
      qx.Property.createMethods(vLocalProps[i], vProto);
    }
  }

  // Set default values
  var vProps = this._newproperties;
  var vName, vProp;
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
