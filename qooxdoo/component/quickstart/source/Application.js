/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * Sample application
 */
qx.Class.define("Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Create button
      var button1 = new qx.ui.form.Button("First Button", "./button.png");

      // Add button to document with coordinates
      this.getRoot().add(button1, {
        left : 50,
        top : 50
      });

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });
    }
  }
});
