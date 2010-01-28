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

#asset(qx/icon/${qx.icontheme}/32/actions/go-home.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Desktop",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var tabView = new qx.ui.tabview.TabView();
      this.getRoot().add(tabView, {edge: 0});

      var page = new qx.ui.tabview.Page("Desktop", "icon/32/actions/go-home.png");
      page.setLayout(new qx.ui.layout.Grow());
      tabView.add(page);

      var windowManager = new qx.ui.window.Manager();

      var desktop = new qx.ui.window.Desktop(windowManager);
      desktop.set({decorator: "main", backgroundColor: "background-pane"});
      page.add(desktop);

      var winDefs = [
        [300, 200, 30, 50],
        [250, 250, 150, 70],
        [400, 300, 300, 60]
      ];

      for (var i=0; i<winDefs.length; i++)
      {
        var def = winDefs[i];
        var win = new qx.ui.window.Window("Window #" + (i+1)).set({
          width: def[0],
          height: def[1],
          showClose : false,
          showMinimize : false
        });
        win.moveTo(def[2], def[3]);

        desktop.add(win);
        win.open();
      }

    }
  }
});
