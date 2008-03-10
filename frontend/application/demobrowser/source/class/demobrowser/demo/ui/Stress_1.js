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

qx.Class.define("demobrowser.demo.ui.Stress_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);
      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      var docLayout = new qx.ui.layout.HBox();
      docLayout.setSpacing(10);

      var container = new qx.ui.core.Widget();
      container.setPadding(20);
      container.setLayout(docLayout);

      doc.add(container, 0, 0);

      docLayout.add(this.getGrid1());
    },


    getGrid1 : function()
    {
      columns = 40;
      rows = 20;
      boxSize = 10;

      // auto size
      var box = new qx.ui.core.Widget();

      var layout = new qx.ui.layout.Basic();
      var widget, left, top;
      var spacing = 2;

      for (var x=0; x<columns; x++)
      {
        for (var y=0; y<rows; y++)
        {
          widget = new qx.ui.core.Widget();
          left = (boxSize + spacing) * x;
          top = (boxSize + spacing) * y;

          widget.set({
            backgroundColor : "red",
            height : boxSize,
            width : boxSize
          });

          layout.add(widget, left, top);
        }
      }

      box.setLayout(layout);
      return box;
    }
  }
});
