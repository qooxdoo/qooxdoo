/*
#module(newproperties)
*/

qx.OO.defineClass("qx.Validation",
{
  "JsDefined" : function(vValue) {
    return vValue != undefined;
  },

  "JsNull" : function(vValue) {
    return vValue === null;
  },

  "JsString" : function(vValue) {
    return typeof vValue == "string";
  },

  "JsNumber" : function(vValue) {
    return typeof vValue == "number" && !isNaN(vValue);
  },

  "JsObject" : function(vValue) {
    return vValue != null && typeof vValue == "object";
  },

  "QxObject" : function(vValue) {
    return vValue instanceof qx.core.Object;
  },

  "QxTarget" : function(vValue) {
    return vValue instanceof qx.core.Target;
  },

  "QxWidget" : function(vValue) {
    return vValue instanceof qx.ui.core.Widget;
  }



});
