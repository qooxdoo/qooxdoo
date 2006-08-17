/**
 * Sample 3
 */
qx.OO.defineClass("custom.Application", qx.component.AbstractApplication,
function () {
  qx.component.AbstractApplication.call(this);
});

qx.Proto.main = function(e)
{
  // create button
  var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "icon/16/reload.png");

  // set button location
  button1.setTop(50);
  button1.setLeft(50);

  // add button to document
  button1.addToDocument();
};
