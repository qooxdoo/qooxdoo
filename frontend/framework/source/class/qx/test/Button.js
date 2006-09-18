/*
#require(qx.Property)
*/

qx.OO.defineClass("qx.test.Button", qx.test.Widget,
function()
{
  qx.test.Widget.call(this);


});

// Inheritance and reconfiguration of existing property
qx.Property.sel("appearance");
qx.Property.tune("default", "button");
