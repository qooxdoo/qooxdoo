/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/image/progressLoader.gif)

************************************************************************ */

/**
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.ProgressLoader",
{
  extend : qx.core.Object,




  /*
          *****************************************************************************
             CONSTRUCTOR
          *****************************************************************************
        */

  construct : function()
  {
    this.base(arguments);
    this.__createLoader();
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
     * @param icon {var} TODOC
     * @return {void} 
     */
    __createLoader : function(icon)
    {
      this.__loader = new qx.ui.window.Window("Loading").set(
      {
        // this.__loader = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
        backgroundColor : "white",
        padding         : [ 4, 4, 4, 4 ],
        allowMaximize   : false,
        allowMinimize   : false
      });

      this.__loader.setLayout(new qx.ui.layout.Canvas());

      this.__root = qx.core.Init.getApplication().getRoot();
      this.__root.setZIndex(99);
      this.__root.block();
      this.__root.setBlockerColor("white");
      this.__root.setBlockerOpacity(0.5);

      this.__loader.add(new qx.ui.basic.Atom("Loading", "toolbox/image/progressLoader.gif"));
      this.__loader.moveTo(400, 300);

      this.__loader.setZIndex(100);

      // this.__loader.setAutoHide(false);
      this.__loader.show();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    unblock : function() {
      this.__root.unblock();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    hideLoader : function() {
      this.__loader.hide();
    }
  }
});