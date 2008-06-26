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

qx.Class.define("demobrowser.demo.ui.BackgroundImage",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.Theme.patch(qx.theme.classic.Color, demobrowser.demo.ui.BackgroundImage_Color);
      qx.Theme.patch(qx.theme.classic.Decoration, demobrowser.demo.ui.BackgroundImage_Decoration);
      qx.Theme.patch(qx.theme.classic.Appearance, demobrowser.demo.ui.BackgroundImage_Appearance);

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);

      var container = new qx.ui.container.Composite(layout);
      container.setPadding(20);

      this.getRoot().add(container, {left: 0, top: 0});

      container.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-button"
      }), {row:0, column: 0});

      container.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-round-button"
      }), {row:0, column: 1});

      container.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-outset-button"
      }), {row:0, column: 2});
    }
  }
});