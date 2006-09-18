/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Widget", qx.test.Object,
function()
{
  qx.test.Object.call(this);


});

// Define new properties
qx.Property.add("tabIndex");
qx.Property.add("width");
qx.Property.add("height");

// Appearance
qx.Property.add("appearance");
qx.Property.tune("default", "button");

// Define new properties including validation
qx.Property.add("color");
qx.Property.tune("validation", "JsObject");
qx.Property.add("backgroundColor");
qx.Property.tune("validation", "JsObject");

// Lazy configuration of previously created property
qx.Property.sel("tabIndex");
qx.Property.tune("validation", "JsNumber");
qx.Property.tune("default", "-1");
