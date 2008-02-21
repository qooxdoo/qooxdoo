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

/**
 * Test the edge case were the available width is normally enough. The content
 * however requires a higher height than the available height. This means it creates
 * a vertical scrollbar and this way stoles the width the required size.
 */
qx.Class.define("demobrowser.demo.ui.ScrollArea_3",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      scrollArea = new qx.ui.core.ScrollArea();
      scrollArea.set({
        width: 300,
        height: 200,
        backgroundColor : "yellow"
      });

      doc.add(scrollArea, 10, 10);
      scrollArea.setContent(this.generateBox());

      var toggle = new qx.ui.basic.Label("Toggle size").set({
        padding : 5,
        backgroundColor: "orange"
      });

      var grow = true;
      toggle.addListener("click", function()
      {
        scrollArea.setHeight(grow ? 300 : 200);
        grow = !grow;
      });

      doc.add(toggle, 10, 400);
    },

    generateBox : function()
    {
      var box = new qx.ui.basic.Label("Content size: 300x300").set({
        width: 300,
        height: 300,
        allowShrinkX: false,
        allowShrinkY: false,
        backgroundColor: "blue",
        textColor: "white",
        padding: 10,
        decorator: new qx.ui.decoration.Basic(4, "solid", "black")
      });
      return box;
    }
  }
});
