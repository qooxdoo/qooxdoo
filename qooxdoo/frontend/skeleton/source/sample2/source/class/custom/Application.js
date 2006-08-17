/**
 * Sample 3
 */
qx.OO.defineClass("custom.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});

qx.Proto.initialize = function(e)
{ 
  qx.manager.object.AliasManager.getInstance().add("custom", "./resource");
};

qx.Proto.main = function(e)
{
  // create button
  var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "custom/image.png");

  // set button location
  button1.setTop(50);
  button1.setLeft(50);

  // add button to document
  button1.addToDocument();
};

qx.Proto.finalize = function(e)
{ 
};

qx.Proto.close = function(e)
{
  // prompt user
  // e.returnValue = "[qooxdoo application: Do you really want to close the application?]";
};

qx.Proto.terminate = function(e)
{
  // alert("terminated");
};
