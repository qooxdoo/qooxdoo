/*
#require(qx.Property)
*/


qx.OO.defineClass("qx.PropertyTest", qx.core.Target,
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
qx.Property.tune("validation", "object");
qx.Property.add("backgroundColor");
qx.Property.tune("validation", "object");

// Verspätete Konfiguration
qx.Property.sel("tabIndex");
qx.Property.tune("validation", "number");
qx.Property.tune("default", "-1");

// Vererbung...
qx.Property.add("appearance");
qx.Property.tune("default", "button");

// ... überschreibe Wert
qx.Property.sel("appearance");
qx.Property.tune("default", "toolbarbutton");



