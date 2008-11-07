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
        this.__popup = new qx.ui.popup.Popup(new qx.ui.layout.Canvas()).set({
          backgroundColor: "white",
          padding: [4, 4, 4, 4]
      });

      this.__root = qx.core.Init.getApplication().getRoot();
      this.__root.setZIndex(99);
      this.__root.block();
      this.__root.setBlockerColor("white");
      this.__root.setBlockerOpacity(0.5);
      

      this.__popup.add(new qx.ui.basic.Atom("Loading", "toolbox/image/progressLoader.gif"));
      this.__popup.moveTo(400, 300);
      this.__popup.setZIndex(100);
      this.__popup.setAutoHide(false);
      this.__popup.show();
    },
    
    unblock : function() {
    	this.__root.unblock();
    },
    
    hidePopup : function() {
      this.__popup.hide();
    }
    
    
    
    
  }
});