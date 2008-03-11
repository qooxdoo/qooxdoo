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

qx.Class.define("demobrowser.demo.layout.ScrollArea_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      qx.theme.manager.Meta.getInstance().setTheme(qx.theme.Classic);

      doc = new qx.ui.root.Application(document);

      scrollArea = new qx.ui.core.ScrollArea();
      scrollArea.set({
        width: 300,
        height: 200,
        backgroundColor : "yellow"
      });

      scrollArea.setContent(this.generateBoxes());
      doc.add(scrollArea, 10, 10);

      var toggle = new qx.ui.form.Button("Toggle size").set({
        padding : 5
      });

      var grow = true;
      toggle.addListener("execute", function()
      {
        scrollArea.setWidth(grow ? 800 : 300);
        grow = !grow;
      });

      doc.add(toggle, 10, 400);
    },

    generateBoxes : function()
    {
      var box = new qx.ui.core.Widget();
      var layout = new qx.ui.layout.Grid();

      for (var y=0; y<10; y++)
      {
        for (var x=0; x<10; x++)
        {
          layout.add((new qx.ui.core.Widget()).set({
            backgroundColor : ((x+y) % 2 == 0) ? "red" : "blue",
            width : 60,
            allowShrinkY : false,
            allowShrinkX : false,
            height : 60
          }), x, y);
        }
      }

      box.setLayout(layout);
      return box;
    }
  }
});
