/*
#require(qx.Property)
#module(newproperties)
*/

qx.OO.defineClass("qx.test.ToolBarButton", qx.test.Button,
function()
{
  qx.test.Button.call(this);


});

// Inheritance and reconfiguration of existing property
qx.Property.sel("appearance");
qx.Property.tune("defaultValue", "toolbarbutton");
