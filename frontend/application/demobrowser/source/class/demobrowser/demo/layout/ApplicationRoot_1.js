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

qx.Class.define("demobrowser.demo.layout.ApplicationRoot_1",
{
  extend : qx.application.Standalone,
  include : [demobrowser.MDemoApplication],

  members :
  {
    main: function()
    {
      this.base(arguments);

      // Call demo mixin init
      this.initDemo();

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      var doc = new qx.ui.root.Application(document);

      doc.setDecorator("black");

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: "black",
        padding: 10
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: "black"
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: "black"
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: "black"
      });


      var layout = new qx.ui.layout.HBox();

      layout.add(w1);
      layout.add(w2);
      layout.add(w3);
      layout.add(w4);

      var container = new qx.ui.core.Widget();
      container.setLayout(layout);

      doc.add(container, 0, 0, 0, 0);
    }
  }
});
