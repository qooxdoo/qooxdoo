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

qx.Class.define("qx.test.ui.layout.Box", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    setUp() {
      super.setUp();
      this.root = new qx.test.ui.layout.LayoutRoot();
    },

    tearDown() {
      super.tearDown();
      this.root.dispose();
    },

    __testExclude(layout, test) {
      // composite
      var comp = new qx.ui.container.Composite();
      comp.setBackgroundColor("#AA0000");
      comp.setLayout(layout);
      this.getRoot().add(comp, { edge: 0 });

      // first excluded, not flex child
      var c1 = new qx.ui.core.Widget();
      c1.setBackgroundColor("#662222");
      c1.exclude();
      comp.add(c1);

      // second child: flex and visible
      var c2 = new qx.ui.core.Widget();
      c2.setBackgroundColor("#FF6666");
      comp.add(c2, { flex: 1 });

      // flush and show the first child
      this.flush();
      c1.show();

      // flush again to render it
      this.flush();
      if (test == "height") {
        var computedHeight = parseInt(
          c1.getContentElement().getStyle("height"),
          10
        );

        var height = c1.getSizeHint().height;
        this.assertEquals(height, computedHeight, "height");
      } else if (test == "width") {
        var computedWidth = parseInt(
          c1.getContentElement().getStyle("width"),
          10
        );

        var width = c1.getSizeHint().width;
        this.assertEquals(width, computedWidth, "width");
      }
      comp.destroy();
    },

    testExcludeHBox() {
      var layout = new qx.ui.layout.HBox();
      this.__testExclude(layout, "width");
      layout.dispose();
    },

    testExcludeVBox() {
      var layout = new qx.ui.layout.VBox();
      this.__testExclude(layout, "height");
      layout.dispose();
    },

    /**
     * The child that moves into the slot of a removed percent-sized child must
     * keep its own size instead of inheriting that percentage.
     *
     * @param layout {qx.ui.layout.Abstract} HBox or VBox instance to test
     * @param dimension {String} "width" for HBox, "height" for VBox
     */
    __testPercentAfterRemove(layout, dimension) {
      var comp = new qx.ui.container.Composite(layout);
      comp.set({ width: 400, height: 400 });
      this.getRoot().add(comp, { left: 0, top: 0 });

      var percentChild = new qx.ui.core.Widget();
      var percentProps = {};
      percentProps[dimension] = "50%";
      comp.add(percentChild, percentProps);

      var plainChild = new qx.ui.core.Widget();
      plainChild.set({ width: 20, height: 20 });
      comp.add(plainChild);

      this.flush();
      this.assertEquals(
        200,
        percentChild.getBounds()[dimension],
        "precondition: the percent child takes half of the container"
      );

      comp.remove(percentChild);
      this.flush();

      this.assertEquals(
        20,
        plainChild.getBounds()[dimension],
        "the remaining child must not inherit the removed child's percentage"
      );

      percentChild.destroy();
      comp.destroy();
    },

    testPercentAfterRemoveHBox() {
      this.__testPercentAfterRemove(new qx.ui.layout.HBox(), "width");
    },

    testPercentAfterRemoveVBox() {
      this.__testPercentAfterRemove(new qx.ui.layout.VBox(), "height");
    }
  }
});
