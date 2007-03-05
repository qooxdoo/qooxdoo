/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * Your custom application
 */
qx.Class.define("custom.Application",
{
  extend : qx.component.AbstractApplication,

  members :
  {
    main : function(e)
    {
      // Create button
      var button1 = new qx.ui.form.Button("First Button", "./button.png");

      // Set button location
      button1.setTop(50);
      button1.setLeft(50);

      // Add button to document
      button1.addToDocument();

      // Add an event listener
      button1.addEventListener("execute", function(e) {
        alert("Hello World!");
      });
    }
  }
});
