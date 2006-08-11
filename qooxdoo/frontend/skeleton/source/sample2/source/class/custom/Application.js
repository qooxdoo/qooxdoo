/**
 * Sample 2
 */
qx.OO.defineClass("custom.Application", qx.core.Object,
function () {
        
  // create button
  var button1 = new qx.ui.form.Button("Welcome to qooxdoo!", "custom/image/sample.png");

  // set button location
  button1.setTop(48);
  button1.setLeft(20);
       
  // add button to document
  button1.addToDocument();
});
