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
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Tango/16/categories/internet.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window_Modern",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Modern);

      this.getRoot().add(this._createTabWindow(), {left: 40, top: 30});
    },


    _createTabWindow : function()
    {
      var win = new qx.ui.window.Window(
        "Modern Window",
        "icon/16/categories/internet.png"
      );

      win.setMinWidth(400);
      win.setMinHeight(300);
      win.setPadding(10);

      win.setLayout(new qx.ui.layout.VBox(10));

      return win;
    }

  }
});
