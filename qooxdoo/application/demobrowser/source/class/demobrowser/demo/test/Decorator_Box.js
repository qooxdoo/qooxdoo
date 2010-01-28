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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(demobrowser/demo/theme/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.test.Decorator_Box",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var win = new qx.ui.window.Window("HBox/VBox Decorator Demo");
      win.setLayout(new qx.ui.layout.Canvas());
      win.open();

      var decorator = new qx.ui.decoration.HBox("demobrowser/demo/theme/tag-hor.png");
      var widget = new qx.ui.core.Widget().set({
        decorator: decorator,
        height: 12
      });
      win.add(widget, {left: 20, top: 0, right: 0});

      var decorator = new qx.ui.decoration.VBox("demobrowser/demo/theme/tag-vert.png");
      var widget = new qx.ui.core.Widget().set({
        decorator: decorator,
        width: 12
      });
      win.add(widget, {left: 0, top: 20, bottom: 0});
    }
  }
});
