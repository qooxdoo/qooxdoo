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
 * Test the edge case were the available height is normally enough. The content
 * however requires a higher width than the available width. This means it creates
 * a horizontal scrollbar and this way stoles the height the required size.
 */
qx.Class.define("demobrowser.demo.layout.ScrollArea_4",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      scrollArea = new qx.ui.container.ScrollArea();
      scrollArea.set({
        width: 200,
        height: 300,
        backgroundColor : "yellow"
      });

      this.getRoot().add(scrollArea, {left: 10, top: 10});
      scrollArea.setContent(this.generateBox());

      var toggle = new qx.ui.form.Button("Toggle size");

      var grow = true;
      toggle.addListener("execute", function()
      {
        scrollArea.setWidth(grow ? 300 : 200);
        grow = !grow;
      });

      this.getRoot().add(toggle, {left: 10, top: 400});
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
        decorator: new qx.ui.decoration.Single(4, "solid", "black")
      });
      return box;
    }
  }
});
