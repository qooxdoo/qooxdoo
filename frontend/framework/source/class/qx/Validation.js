qx.OO.defineClass("qx.Validation",
{
  "js-defined" : function(vValue) {
    return typeof vValue != null;
  },

  "js-string" : function(vValue) {
    return typeof vValue == "string";
  },

  "js-number" : function(vValue) {
    return typeof vValue == "number";
  },

  "js-object" : function(vValue) {
    return vValue != null && typeof vValue == "object";
  },

  "qx-object" : function(vValue) {
    return vValue instanceof qx.core.Object;
  },

  "qx-target" : function(vValue) {
    return vValue instanceof qx.core.Target;
  },

  "qx-widget" : function(vValue) {
    return vValue instanceof qx.ui.core.Widget;
  }



});
