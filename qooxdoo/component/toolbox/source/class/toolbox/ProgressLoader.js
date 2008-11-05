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
#asset(toolbox/*)

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
  construct : function() {
  		this.base(arguments);
  		this.__createPopup();
  },

    /*
      *****************************************************************************
         MEMBERS
      *****************************************************************************
    */

  members :
  {
      __createPopup : function() {
        var popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
          backgroundColor: "white",
          padding: [4, 4, 4, 4]
      });
      
      
      //TODO
      /*
      var abstractRoot = new qx.ui.root.Abstract();
      abstractRoot.setZIndex(99);
      abstractRoot.block();
      abstractRoot.setBlockerColor("white");
      abstractRoot.setBlockerOpacity(20);
      
      */
      
      
      popup.add(new qx.ui.basic.Atom("Run Forest run!", "toolbox/image/progressLoader.gif"));
      popup.moveTo(250, 300);
      popup.setZIndex(100);
      popup.setAutoHide(false);
      popup.show();
    }
    
  }
});