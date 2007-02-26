/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#resource(image:image)

************************************************************************ */

/**
 * Your custom application
 */
qx.Clazz.define("custom.Application",
{
  extend : qx.component.AbstractApplication,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.component.AbstractApplication.call(this);
  },


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
     * @param e {Event} TODOC
     * @return {void} 
     */
    initialize : function(e)
    {
      // Define alias for custom resource path
      qx.manager.object.AliasManager.getInstance().add("custom", qx.core.Setting.get("custom.resourceUri"));
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    main : function(e)
    {
      // Create button
      var button1 = new qx.ui.form.Button("First Button", "custom/image/test.png");

      // Set button location
      button1.setTop(50);
      button1.setLeft(50);

      // Add button to document
      button1.addToDocument();

      // Attach a tooltip
      button1.setToolTip(new qx.ui.popup.ToolTip("A nice tooltip", "icon/32/status/dialog-information.png"));

      // Add an event listener
      button1.addEventListener("execute", function(e) {
        alert("Hello World!");
      });
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    finalize : function(e)
    {
      // After initial rendering...
    },

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    close : function(e)
    {
      // Prompt user
      // e.returnValue = "[qooxdoo application: Do you really want to close the application?]";  
    },

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void} 
     */
    terminate : function(e) {}
  },


  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : { "custom.resourceUri" : "./resource" }
});
