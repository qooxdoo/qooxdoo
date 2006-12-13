/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#resource(customimages:image)

************************************************************************ */

/**
 * Your custom application
 */
qx.OO.defineClass("custom.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});

qx.Settings.setDefault("resourceUri", "./resource");





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.initialize = function(e)
{
  // Define alias for custom resource path
  qx.manager.object.AliasManager.getInstance().add("custom", qx.Settings.getValueOfClass("custom.Application", "resourceUri"));
};

qx.Proto.main = function(e)
{
  // Create button
  var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "custom/image/test.png");

  // Set button location
  button1.setTop(50);
  button1.setLeft(50);

  // Add button to document
  button1.addToDocument();
};

qx.Proto.finalize = function(e)
{
  // After initial rendering...
};

qx.Proto.close = function(e)
{
  // Prompt user
  // e.returnValue = "[qooxdoo application: Do you really want to close the application?]";
};

qx.Proto.terminate = function(e)
{
  // alert("terminated");
};
