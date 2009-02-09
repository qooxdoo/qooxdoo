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
 * This class shows a progess loader during all processes
 */
qx.Class.define("toolbox.builder.ProgressLoader",
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

    var layout = new qx.ui.layout.VBox(5);
    this.setLayout(layout);
	
    this.set(
    {
      padding       : [ 4, 4, 4, 4 ],
      allowMaximize : false,
      allowMinimize : false,
      showMinimize  : false,
      showMaximize  : false,
      showClose     : false,
      resizable     : false
    });

    this.__root = qx.core.Init.getApplication().getRoot();
    this.__root.setBlockerColor("white");
    this.__root.setBlockerOpacity(0.5);
	
    //loader image (gif) to show the steps
    var loaderImage = new qx.ui.basic.Atom(null, "toolbox/image/progressLoader.gif");
    this.add(loaderImage);
    this.add(new qx.ui.basic.Label("  This process will take few minutes!"));
    this.moveTo(400, 300);
    this.show();
    this.setModal(true);
  }
});