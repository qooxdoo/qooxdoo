/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-09 1&1 Internet AG, Germany, http://www.1und1.de

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
 * This class contains the whole content of the Home pane
 */
qx.Class.define("toolbox.content.HomeContent",
{
  extend : qx.ui.container.Composite,

  construct : function()
  {
    this.base(arguments);
    var layout = new qx.ui.layout.Grid();
    this.setLayout(layout);
    this.setBackgroundColor("white");
    
	var general = new qx.ui.toolbar.RadioButton("General");
    var development = new qx.ui.toolbar.RadioButton("Development");
    var builtIns = new qx.ui.toolbar.RadioButton("Built-ins");
    
    var toolbar = new qx.ui.toolbar.ToolBar;
    toolbar.setPadding(0, 0, 0, 0);
    toolbar.setSpacing(0);
    
    toolbar.add(general);
    toolbar.add(development);
    
    
    
    this.add(toolbar,
    {
      row     : 0,
      column  : 0,
      rowSpan : 0,
      colSpan : 0
    });
    
   
    
    
    
  }
});