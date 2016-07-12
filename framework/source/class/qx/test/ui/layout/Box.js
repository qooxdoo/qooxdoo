/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */

qx.Class.define("qx.test.ui.layout.Box",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function() {
      this.base(arguments);
      this.root = new qx.test.ui.layout.LayoutRoot();
    },

    tearDown : function() {
      this.base(arguments);
      this.root.dispose();
    },


    __testExclude : function(layout, test)
    {
      // composite
      var comp = new qx.ui.container.Composite();
      comp.setBackgroundColor("#AA0000");
      comp.setLayout(layout);
      this.getRoot().add(comp, {edge: 0});

      // first excluded, not flex child
      var c1 = new qx.ui.core.Widget();
      c1.setBackgroundColor("#662222");
      c1.exclude();
      comp.add(c1);

      // second child: flex and visible
      var c2 = new qx.ui.core.Widget();
      c2.setBackgroundColor("#FF6666");
      comp.add(c2, {flex: 1});

      // flush and show the first child
      this.flush();
      c1.show();

      // flush again to render it
      this.flush();
      if (test == "height") {
        var computedHeight = parseInt(c1.getContentElement().getStyle("height"), 10);
        var height = c1.getSizeHint().height;
        this.assertEquals(height, computedHeight, "height");
      } else if (test == "width") {
        var computedWidth = parseInt(c1.getContentElement().getStyle("width"), 10);
        var width = c1.getSizeHint().width;
        this.assertEquals(width, computedWidth, "width");
      }
      comp.destroy();
    },


    testExcludeHBox : function()
    {
      var layout = new qx.ui.layout.HBox();
      this.__testExclude(layout, "width");
      layout.dispose();
    },

    testExcludeVBox : function()
    {
      var layout = new qx.ui.layout.VBox();
      this.__testExclude(layout, "height");
      layout.dispose();
    }
  }
});
