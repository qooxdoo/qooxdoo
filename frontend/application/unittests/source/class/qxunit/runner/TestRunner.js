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
      width : "100%"
      //border : "ridge"
      //border          : qx.renderer.border.BorderPresets.getInstance().inset
    });
    
    // Header Pane
    this.header = new qx.ui.embed.HtmlEmbed("<center><h3>QxRunner - The qooxdoo Test Runner</h3></center>");
    this.header.setHeight(70);
    this.add(this.header);
    
    // Toolbar
    this.toolbar = new qx.ui.toolbar.ToolBar;
    this.runbutton = new qx.ui.toolbar.Button("Run Test", "icon/16/categories/applications-development.png");
    this.toolbar.add(this.runbutton);
    this.toolbar.set({
      width : "100%",
      border : "inset"
    });
    this.add(this.toolbar);
    
    
    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    mainsplit.setLiveResize(true);
    mainsplit.set({
      height : "1*"
    });
    // Left
    var left = new qx.ui.tree.Tree("Test Classes");
    left.set({
      width : "100%",
      height : "100%",
      padding : [10],
      border : "inset"
    });
    mainsplit.addLeft(left);
    var right = new qx.ui.layout.VerticalBoxLayout();
    right.set({
      width : "100%",
      spacing : 10, 
      height : "100%",
      border : "inset",
      padding : [10]
    });   
    mainsplit.addRight(right);
    // Right
    // status
    var statuspane = new qx.ui.layout.HorizontalBoxLayout();
    right.add(statuspane);
    statuspane.set({
      border : "inset",
      padding: [10],
      spacing : 10, 
      height : "auto",
      width : "100%"
    });
    statuspane.add(new qx.ui.basic.Label("Current Test: "));
    var l1 = new qx.ui.basic.Label("qxunit.test.core.Variants");
    statuspane.add(l1);
    l1.set({
      backgroundColor : "#C1ECFF"
    });
    statuspane.add(new qx.ui.basic.Label("Number of Test: "));
    var l2 = new qx.ui.basic.Label("9");
    statuspane.add(l2);
    l2.set({
      backgroundColor : "#C1ECFF"
    });
    // progress bar
    var progress = new qx.ui.layout.HorizontalBoxLayout();
    right.add(progress);
    progress.set({
      border: "inset",
      height: "auto",
      padding: [5],
      spacing : 10, 
      width : "100%"
    });
    progress.add(new qx.ui.basic.Label("Progress: "));
    var progressb = new qxunit.runner.ProgressBar();
    progress.add(progressb);
    /*
    var progressb = new qx.ui.component.ProgressBar();
    progressb.set({
      barColor : "blue",
      scale    : null,   // display no scale
      startLabel : "0%",
      endLabel   : "100%",
      fillLabel : "(0/10)", // status label right of bar
      fillStatus: "60%"     // fill degree of the progress bar
    });
    progressb.update("9/15"); // update progress
    progressb.update("68%");  // dito
    */
    progress.add(new qx.ui.basic.Label("(7/15)  (63%)"));
    // button view
    var buttview = new qx.ui.pageview.tabview.TabView();
    buttview.set({
      width: "100%",
      border: "inset",
      height: "1*"
    });
    right.add(buttview);

    var bsb1 = new qx.ui.pageview.tabview.Button("Test Results", "icon/16/devices/video-display.png");
    var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/apps/graphics-snapshot.png");
    bsb1.setChecked(true);
    buttview.getBar().add(bsb1, bsb2);

    var p1 = new qx.ui.pageview.tabview.Page(bsb1);
    p1.set({
      padding : [5],
      //spacing   : 5
    });
    var p2 = new qx.ui.pageview.tabview.Page(bsb2);
    p2.set({
      padding : [5]
    });
    buttview.getPane().add(p1, p2);
    buttview.getPane().set({
      height : "100%"
    });


    var f1 = new qx.ui.form.TextField("Results of the current Test");
    f1.set({
      //width : "100%",
      //height : "100%",
      //border : "inset",
      padding : [10]
    });
    var f2 = new qx.ui.form.TextField("Session Log, listing test invokations and all outputs");
    p1.add(f1);
    p2.add(f2);

  }
});


