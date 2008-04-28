/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#resource(custom.image:image)

// List all static resources that should be copied into the build version
// if the resource filter option is enabled (default: ensabled)
#asset(qx/icon/Oxygen/32/status/dialog-information.png)
#asset(custom/image/test.png)

************************************************************************ */

/**
 * Your custom application
 */
qx.Class.define("custom.Application",
{
  extend : qx.application.Standalone,



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

      var doc = new qx.ui.root.Application(document);

      // Define alias for custom resource path
      qx.util.AliasManager.getInstance().add("custom", qx.core.Setting.get("custom.resourceUri"));

      // Create button
      var button1 = new qx.ui.form.Button("First Button", "custom/image/test.png");

      doc.add(button1, 50, 50);


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
