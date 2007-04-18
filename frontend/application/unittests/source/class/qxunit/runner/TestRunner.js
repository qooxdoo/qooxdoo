/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

/**
 * The GUI definition of the API viewer.
 *
 * The connections between the GUI components are established in
 * the {@link Controller}.
 */
qx.Class.define("qxunit.runner.TestRunner",
{
  extend : qx.ui.layout.VerticalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
    this.set({
      height : "100%",
      width : "100%",
      //border : "ridge"
      //border          : qx.renderer.border.BorderPresets.getInstance().inset
    });
    
    // Header Pane
    this.header = new qx.ui.embed.HtmlEmbed("<h1>Header</h1>");
    this.header.setHeight(70);
    this.add(this.header);
    
    // Toolbar
    this.toolbar = new qx.ui.toolbar.ToolBar;
    this.runbutton = new qx.ui.toolbar.Button("Run Test");
    this.toolbar.add(this.runbutton);
    this.toolbar.set({
      width : "100%",
      border : "inset"
    });
    this.add(this.toolbar);
    
    
    // Main Pane
    this.mainpane = new qx.ui.layout.VerticalBoxLayout();
    //this.add(this.mainpane);
    this.mainpane.set({
      height: "1*",
      border: "black"
    });
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    mainsplit.setLiveResize(true);
    // left
    var left = new qx.ui.tree.Tree("Test Classes");
    left.set({
      width : "100%",
      height : "100%"
    });
    mainsplit.addLeft(left);
    
    var right = new qx.ui.layout.VerticalBoxLayout();
    right.set({
      width : "100%",
      height : "100%"
    });   
    mainsplit.addRight(right);

    //this.mainpane.add(mainsplit);
    this.add(mainsplit);

    // right
    var statuspane = new qx.ui.layout.HorizontalBoxLayout();
    right.add(statuspane);
    statuspane.set({width : "100%"});
    statuspane.add(new qx.ui.basic.Label("Here goes the Status Info"));
    
    
    
    
  }
});