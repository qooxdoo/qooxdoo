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

/**
 * @tag test
 */
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
      win.moveTo(20, 20);
      win.open();

      var decorator_horizontal = new qx.ui.decoration.HBox("demobrowser/demo/theme/tag-hor.png");
      var widget_horizontal = new qx.ui.core.Widget().set({
        decorator: decorator_horizontal,
        height: 12
      });
      win.add(widget_horizontal, {left: 10, top: 10, right: 0});


      var decorator_vertical = new qx.ui.decoration.VBox("demobrowser/demo/theme/tag-vert.png");
      var widget_vertical = new qx.ui.core.Widget().set({
        decorator: decorator_vertical,
        width: 12
      });
      win.add(widget_vertical, {left: 10, top: 60, bottom: 0});

    }
  }
});
