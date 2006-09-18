qx.OO.defineClass("qx.test.ToolBarButton", qx.test.Button,
function()
{
  qx.PropertyTestButton.call(this);


});

// ... überschreibe Wert
qx.Property.sel("appearance");
qx.Property.tune("default", "toolbarbutton");
