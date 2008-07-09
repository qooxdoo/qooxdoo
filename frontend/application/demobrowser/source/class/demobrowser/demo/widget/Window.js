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

#asset(qx/icon/${qx.icontheme}/16/categories/internet.png)
#asset(qx/icon/${qx.icontheme}/16/categories/engineering.png)
#asset(qx/icon/${qx.icontheme}/48/apps/video-player.png)
#asset(qx/icon/${qx.icontheme}/48/apps/internet-mail.png)
#asset(qx/icon/${qx.icontheme}/48/apps/internet-web-browser.png)
#asset(qx/icon/${qx.icontheme}/48/apps/photo-album.png)
#asset(qx/icon/${qx.icontheme}/48/apps/office-writer.png)
#asset(qx/icon/${qx.icontheme}/16/places/user-home.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var winTab = this._createTabWindow();
      this.getRoot().add(winTab);
      winTab.centerToParent();
    },


    _createTabWindow : function()
    {
      var win = new qx.ui.window.Window(
        "First Window",
        "icon/16/categories/internet.png"
      );

      win.setPadding(10);
      win.setLayout(new qx.ui.layout.VBox(10));

      var atom = new qx.ui.basic.Atom(
        "Welcome to your first own Window.<br/>Have fun!",
        "icon/48/apps/internet-mail.png"
      );
      atom.setRich(true);
      win.add(atom);

      var tabview = new qx.ui.tabview.TabView().set({
        allowGrowY: true
      });
      tabview.add(new qx.ui.tabview.Page("Explore"));
      tabview.add(new qx.ui.tabview.Page("Internet"));
      tabview.add(new qx.ui.tabview.Page("Future"));
      win.add(tabview, {flex: 1});

      win.addListener("beforeClose", this.cancelHandler, this);
      win.addListener("beforeRestore", this.cancelHandler, this);
      win.addListener("beforeMinimize", this.cancelHandler, this);
      win.addListener("beforeMaximize", this.cancelHandler, this);

      return win;
    },


    cancelHandler : function(e)
    {
      if (e.isCancelable())
      {
        if (!window.confirm("Really '" + e.getType() + "' window?")) {
          e.preventDefault();
        }
      }
    }
  }
});
