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

#asset(qx/icon/Oxygen/16/places/user-home.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.Window",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var win = new qx.ui.window.Window("Home", "icon/16/places/user-home.png");
      this.getRoot().add(win);

      var win = new qx.ui.window.Window("Home", "icon/16/places/user-home.png").set({
        width: 300,
        height: 200,
        showStatusbar: true,
        moveMethod: "translucent"
      });

      win.setLayout(new qx.ui.layout.VBox());
      win.add(new qx.ui.form.Button("Juhu"));
      win.add(new qx.ui.form.Button("Kinners"));

      this.getRoot().add(win, {left: 100, top: 200});
    }
  }
});
