/*
#require(qx.Property)
*/


qx.OO.defineClass("qx.PropertyTestWidget", qx.core.Target,
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




qx.OO.defineClass("qx.PropertyTestButton", qx.PropertyTestWidget,
function()
{
  qx.PropertyTest.call(this);


});

// Vererbung...
qx.Property.add("appearance");
qx.Property.tune("default", "button");






qx.OO.defineClass("qx.PropertyTestToolBarButton", qx.PropertyTestButton,
function()
{
  qx.PropertyTestButton.call(this);


});

// ... überschreibe Wert
qx.Property.sel("appearance");
qx.Property.tune("default", "toolbarbutton");



