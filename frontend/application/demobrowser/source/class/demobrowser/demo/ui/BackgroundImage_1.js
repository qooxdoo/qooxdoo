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

qx.Class.define("demobrowser.demo.ui.BackgroundImage_1",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.Theme.patch(qx.theme.classic.Color, demobrowser.demo.ui.BackgroundImage_1_Color);
      qx.Theme.patch(qx.theme.classic.Decoration, demobrowser.demo.ui.BackgroundImage_1_Decoration);
      qx.Theme.patch(qx.theme.classic.Appearance, demobrowser.demo.ui.BackgroundImage_1_Appearance);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(layout);

      doc.add(container, 0, 0);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-button"
      }), 0, 0);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-round-button"
      }), 0, 1);

      layout.add(new qx.ui.form.Button("Juhu Kinners").set({
        appearance: "shaded-outset-button"
      }), 0, 2);
    }
  }
});