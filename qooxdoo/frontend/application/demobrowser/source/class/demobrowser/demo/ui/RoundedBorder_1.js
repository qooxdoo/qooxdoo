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

qx.Class.define("demobrowser.demo.ui.RoundedBorder_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("#EEE");

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      qx.theme.manager.Color.getInstance().setTheme(qx.theme.classic.Color);
      qx.theme.manager.Decoration.getInstance().setTheme(demobrowser.demo.ui.RoundedBorder_1_Theme);

      docLayout.add(this.getGrid1());

    },


    getGrid1 : function()
    {
      var theme = demobrowser.demo.ui.RoundedBorder_1_Theme;

      qx.theme.manager.Color.getInstance().setTheme(qx.theme.classic.Color);
      qx.theme.manager.Decoration.getInstance().setTheme(theme);

      // auto size
      var box = (new qx.ui.core.Widget).set({
        padding: 5,
        backgroundColor: "#CCC"
      });
      var layout = new qx.ui.layout.Grid();
      layout.setSpacing(10);

      var decorations = theme.decorations;

      var columns = 5;

      var i=0;
      for (var key in decorations)
      {
        layout.add(new qx.ui.basic.Label(key).set({
          decorator: key,
          backgroundColor: "gray",
          padding: 20,
          height: 100,
          width: 100
        }), Math.floor(i/columns), i%columns);
        i += 1;
      }

      box.setLayout(layout);

      return box;
    }
  }
});
