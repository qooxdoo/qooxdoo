/*
#require(qx.Property)
*/


qx.OO.defineClass("qx.test.Widget", qx.core.Target,
function()
{
  qx.core.Target.call(this);


});

// Neue Properties definieren
qx.Property.add("tabIndex");
qx.Property.add("width");
qx.Property.add("height");

// Neue Properties definieren mit einem type
qx.Property.add("color");
qx.Property.tune("validation", "JsObject");
qx.Property.add("backgroundColor");
qx.Property.tune("validation", "JsObject");

// Verspätete Konfiguration
qx.Property.sel("tabIndex");
qx.Property.tune("validation", "JsNumber");
qx.Property.tune("default", "-1");
