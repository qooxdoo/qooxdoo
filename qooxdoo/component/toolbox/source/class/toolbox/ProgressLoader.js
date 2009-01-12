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
  extend : qx.ui.window.Window,




  /*
          *****************************************************************************
             CONSTRUCTOR
          *****************************************************************************
        */

  construct : function()
  {
    this.base(arguments);
    this.set({
        padding         : [ 4, 4, 4, 4 ],
        allowMaximize   : false,
        allowMinimize   : false,
        showMinimize    : false,
        showMaximize    : false,
        showClose       : false,
        resizable       : false
     });

      
      this.__root = qx.core.Init.getApplication().getRoot();
      this.__root.setBlockerColor("white");
      this.__root.setBlockerOpacity(0.5);
     
      this.setLayout(new qx.ui.layout.Canvas());

      this.add(new qx.ui.basic.Atom(null, "toolbox/image/progressLoader.gif"));
      this.moveTo(400, 300);
      this.show();
      this.setModal(true);
  }


});