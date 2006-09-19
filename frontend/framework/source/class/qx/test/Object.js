/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Object", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  this._values_ng = {};

  var vConstructor = this.constructor;
  var vProto = vConstructor.prototype;
  var vProps = this._properties_available_ng;
  var vName, vProp;

  for (vName in vProps)
  {
    vEntry = vProps[vName];
    vSetterName = "set" + vEntry.upname;

    // Notiz: Wenn wir einen defaultValue haben, koennte man gleich den richtigen setter generieren

    // If the setter is not available
    if (this[vSetterName] == undefined)
    {
      qx.Property.createMethods(vName, vEntry.relation);
    }

    // Is local but not defined in our prototype
    else if (vEntry.relation == this.constructor.prototype && vConstructor.superclass.prototype[vSetterName] == this[vSetterName])
    {
      qx.Property.createMethods(vName, vEntry.relation);
    }

    if (vEntry.defaultValue != undefined) {
      this[vSetterName](vEntry.defaultValue);
    }
  }
});

qx.Proto._properties_available_ng = {};

qx.Property.add("id");
