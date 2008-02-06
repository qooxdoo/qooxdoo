/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#resource(custom.image:image)

// List all static resources that should be copied into the build version,
// if the resource filter option is enabled (default: disabled)
#embed(qx.icontheme/32/status/dialog-information.png)
#embed(custom.image/test.png)

************************************************************************ */

/**
 * Your custom application
 */
qx.Class.define("custom.Application",
{
  extend : qx.application.Gui,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     */
    main : function()
    {
      this.base(arguments);

      // Define alias for custom resource path
      qx.io.Alias.getInstance().add("custom", qx.core.Setting.get("custom.resourceUri"));

      // Create button
      var button1 = new qx.legacy.ui.form.Button("First Button", "custom/image/test.png");

      // Set button location
      button1.setTop(50);
      button1.setLeft(50);

      // Add button to document
      button1.addToDocument();

      // Attach a tooltip
      button1.setToolTip(new qx.legacy.ui.popup.ToolTip("A nice tooltip", "icon/32/status/dialog-information.png"));

      // Add an event listener
      button1.addListener("execute", function(e) {
        alert("Hello World!");
      });
    },


    /**
     * TODOC
     *
     * @type member
     */
    close : function()
    {
      this.base(arguments);

      // Prompt user
      // return "Do you really want to close the application?";
    },


    /**
     * TODOC
     *
     * @type member
     */
    terminate : function() {
      this.base(arguments);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "custom.resourceUri" : "./resource"
  }
});
