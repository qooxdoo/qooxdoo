/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/apps/utilities-terminal.png)
#asset(qx/icon/${qx.icontheme}/16/apps/accessories-notes.png)
#asset(qx/icon/${qx.icontheme}/16/apps/accessories-calculator.png)
#asset(qx/icon/${qx.icontheme}/16/apps/help-browser.png)
#asset(qx/icon/${qx.icontheme}/16/apps/utilities-terminal.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.TabView",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      container.setPadding(20);

      this.getRoot().add(container, {left:0,top:0});

      container.add(this.getTabView1());
      container.add(this.getTabView2());
    },

    getTabView1 : function()
    {
      tabView = new qx.ui.tabview.TabView();
      tabView.setWidth(500);


      ////////////////// TEST PAGE 1 ////////////////////
      var page1 = new qx.ui.tabview.Page("Layout", "icon/16/apps/utilities-terminal.png");
      page1.setLayout(new qx.ui.layout.VBox());
      page1.add(new qx.ui.basic.Label("Layout-Settings"));
      tabView.add(page1);

      // layout settings options
      // create radio buttons
      var barTopButton = new qx.ui.form.RadioButton("top");
      var barLeftButton = new qx.ui.form.RadioButton("left");
      var barBottomButton = new qx.ui.form.RadioButton("bottom");
      var barRightButton = new qx.ui.form.RadioButton("right");

      // container for radio buttons
      var pageContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      pageContainer.add(barTopButton);
      pageContainer.add(barLeftButton);
      pageContainer.add(barBottomButton);
      pageContainer.add(barRightButton);

      page1.add(pageContainer);

      // radiogroup
      var manager = new qx.ui.form.RadioGroup(barTopButton, barLeftButton, barBottomButton, barRightButton);
      manager.addListener("changeValue", function(e){
        this.setBarPosition(e.getData());
      }, tabView);


      ////////////////// TEST PAGE 2 ////////////////////
      var page2 = new qx.ui.tabview.Page("Notes", "icon/16/apps/accessories-notes.png");
      page2.setLayout(new qx.ui.layout.VBox());
      page2.add(new qx.ui.basic.Label("Notes..."));
      tabView.add(page2);


      ////////////////// TEST PAGE 3 ////////////////////
      var page3 = new qx.ui.tabview.Page("Calculator", "icon/16/apps/accessories-calculator.png");
      page3.setLayout(new qx.ui.layout.VBox());
      page3.add(new qx.ui.basic.Label("Calculator..."));
      tabView.add(page3);
      page3.setEnabled(false);


      ////////////////// TEST PAGE 4 ////////////////////
      var page4 = new qx.ui.tabview.Page("Help", "icon/16/apps/help-browser.png");
      page4.setLayout(new qx.ui.layout.VBox());
      page4.add(new qx.ui.basic.Label("Help..."));
      tabView.add(page4);

      // show the first page
      tabView.setSelected(page1);

      return tabView;
    },


    getTabView2 : function()
    {
      tabView = new qx.ui.tabview.TabView();
      tabView.setWidth(500);

      for (var i=1; i<=20; i++)
      {
        var page = new qx.ui.tabview.Page("Page #" + i, "icon/16/apps/utilities-terminal.png");
        page.setLayout(new qx.ui.layout.VBox());
        page.add(new qx.ui.basic.Label("Page #" + i));
        tabView.add(page);
      }
      return tabView;
    }
  }
});
