/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.layout.Flow",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    _container : null,

    setUp : function() {
      this.root = new qx.test.ui.layout.LayoutRoot();
      this.flush();
    },

    tearDown : function() {
      this.root.dispose();
      var children = this._container.getLayoutChildren();
      for (var i=0, l=children.length; i<l; i++) {
        this._container.remove(children[i]);
        children[i].dispose();
      }
      this.root.remove(this._container);
      this._container._getLayout().dispose();
      this._container.dispose();
    },

    flush : function() {
      qx.ui.core.queue.Manager.flush();
    },

    // test for bug #6818
    testChangeThemeFromFlow : function() {
      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);

      this._container = new qx.test.ui.layout.LayoutItem(200, 200);
      this._container.setLayout(new qx.ui.layout.Flow());
      this._container.add(c1);
      this.root.add(this._container);

      // change the theme should not throw an exception
      this._container.setLayout(new qx.ui.layout.HBox());
    },


    testChildrenFitInLine : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(400, 50).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();

      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 100,
        height: 50
      }, c1.bounds);

      this.assertJsonEquals({
        left: 100,
        top: 0,
        width: 100,
        height: 50
      }, c2.bounds);

      this.assertJsonEquals({
        left: 200,
        top: 0,
        width: 100,
        height: 50
      }, c3.bounds);
    },


    testAutoSize : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));

      this.flush();

      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 300,
        height: 50
      }, container.bounds);

      // resize first
      container.getLayoutChildren()[0].setHeight(60);
      this.flush();

      this.assertEquals(60, container.bounds.height);
      this.assertEquals(60, container.getLayoutChildren()[0].bounds.height);
      this.assertEquals(50, container.getLayoutChildren()[1].bounds.height);
    },


    testWrapThirdChild : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(250, 300).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));

      this.flush();

      var children = container.getLayoutChildren();
      this.assertEquals(0, children[0].bounds.top);
      this.assertEquals(0, children[0].bounds.left);
      this.assertEquals(0, children[1].bounds.top);
      this.assertEquals(100, children[1].bounds.left);
      this.assertEquals(50, children[2].bounds.top);
      this.assertEquals(0, children[2].bounds.left);
    },


    testAlignX : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(500, 300).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));

      layout.setAlignX("left");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(0, children[0].bounds.left, "align left");
      this.assertEquals(100, children[1].bounds.left, "align left");
      this.assertEquals(200, children[2].bounds.left, "align left");

      layout.setAlignX("right");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(200, children[0].bounds.left, "align right");
      this.assertEquals(300, children[1].bounds.left, "align right");
      this.assertEquals(400, children[2].bounds.left, "align right");

      layout.setAlignX("center");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(100, children[0].bounds.left, "align center");
      this.assertEquals(200, children[1].bounds.left, "align center");
      this.assertEquals(300, children[2].bounds.left, "align center");
    },


    testAlignXWithWrapping : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(80, 300).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(50, 50));
      container.add(new qx.test.ui.layout.LayoutItem(60, 50));
      container.add(new qx.test.ui.layout.LayoutItem(70, 50));

      layout.setAlignX("right");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(30, children[0].bounds.left, "align right");
      this.assertEquals(20, children[1].bounds.left, "align right");
      this.assertEquals(10, children[2].bounds.left, "align right");

      layout.setAlignX("center");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(15, children[0].bounds.left);
      this.assertEquals(10, children[1].bounds.left);
      this.assertEquals(5, children[2].bounds.left);
    },


    testLayoutAlignY : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(100, 60));
      container.add(new qx.test.ui.layout.LayoutItem(100, 100));
      container.add(new qx.test.ui.layout.LayoutItem(100, 40));

      // reference
      container.add(new qx.test.ui.layout.LayoutItem(100, 160));

      layout.setAlignY("top");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(0, children[0].bounds.top);
      this.assertEquals(0, children[1].bounds.top);
      this.assertEquals(0, children[2].bounds.top);

      layout.setAlignY("middle");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(50, children[0].bounds.top);
      this.assertEquals(30, children[1].bounds.top);
      this.assertEquals(60, children[2].bounds.top);

      layout.setAlignY("bottom");
      this.flush();
      var children = container.getLayoutChildren();
      this.assertEquals(100, children[0].bounds.top);
      this.assertEquals(60, children[1].bounds.top);
      this.assertEquals(120, children[2].bounds.top);
    },


    testChildAlignY : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 60).set({
        alignY: "top"
      });
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 100).set({
        alignY: "middle"
      });
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 40).set({
        alignY: "bottom"
      });
      container.add(c3);

      // reference
      container.add(new qx.test.ui.layout.LayoutItem(100, 160));

      this.flush();
      this.assertEquals(0, c1.bounds.top);
      this.assertEquals(30, c2.bounds.top);
      this.assertEquals(120, c3.bounds.top);
    },


    testReversed : function()
    {
      var layout = new qx.ui.layout.Flow().set({
        reversed: false
      });
      var container = this._container = new qx.test.ui.layout.LayoutItem(400, 50).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();
      this.assertArrayEquals([c1, c2, c3], container.getLayoutChildren());

      layout.setReversed(true);
      this.flush();
      this.assertArrayEquals([c1, c2, c3], container.getLayoutChildren());
      this.assertEquals(200, c1.bounds.left);
      this.assertEquals(100, c2.bounds.left);
      this.assertEquals(0, c3.bounds.left);
    },


    testLineBreakAutoSize : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      container.add(new qx.test.ui.layout.LayoutItem(100, 50));
      container.add(new qx.test.ui.layout.LayoutItem(100, 50), {lineBreak : true});
      container.add(new qx.test.ui.layout.LayoutItem(100, 50));

      this.flush();
      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 200,
        height: 100
      }, container.bounds);

      var children = container.getLayoutChildren();
      this.assertEquals(0, children[0].bounds.top);
      this.assertEquals(0, children[1].bounds.top);
      this.assertEquals(50, children[2].bounds.top);
      this.assertEquals(0, children[2].bounds.left);
    },


    testMargins : function()
    {
      var layout = new qx.ui.layout.Flow().set();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: [10, 20, 30, 40]
      });
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();
      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 360,
        height: 90
      }, container.bounds);

      this.assertJsonEquals({
        left: 140,
        top: 10,
        width: 100,
        height: 50
      }, c2.bounds);

      this.assertEquals(260, c3.bounds.left);
    },


    testMarginXCollapse : function()
    {
      var layout = new qx.ui.layout.Flow().set();
      var container = this._container = new qx.test.ui.layout.LayoutItem(300, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: [5, 10, 15, 20]
      });
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: [10, 20, 30, 40]
      });
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: [15]
      });
      container.add(c3);

      this.flush();

      // no Y collapsing of margins
      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 300,
        height: 50+40 + 50+30
      }, container.bounds);

      this.assertEquals(20, c1.bounds.left);
      this.assertEquals(160, c2.bounds.left);
    },


    testSpacingX : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();
      layout.setSpacingX(10);

      this.flush();
      this.assertEquals(320, container.bounds.width);
      this.assertEquals(0, c1.bounds.left);
      this.assertEquals(110, c2.bounds.left);
      this.assertEquals(220, c3.bounds.left);
    },


    testSpacingXAndMarginCollapsing : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(null, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: 5
      });
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: 5
      });
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50).set({
        margin: 15
      });
      container.add(c3);

      layout.setSpacingX(10);

      this.flush();
      this.assertEquals(5+100+10+100+15+100, container.bounds.width);
      this.assertEquals(5, c1.bounds.left);
      this.assertEquals(5+100+10, c2.bounds.left);
      this.assertEquals(5+100+10+100+15, c3.bounds.left);
    },


    testSpacingY : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(110, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();
      layout.setSpacingY(10);

      this.flush();
      this.assertEquals(170, container.bounds.height);
      this.assertEquals(0, c1.bounds.top);
      this.assertEquals(60, c2.bounds.top);
      this.assertEquals(120, c3.bounds.top);
    },


    testHeightForWidth : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(110, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c2);
      var c3 = new qx.test.ui.layout.LayoutItem(100, 50);
      container.add(c3);

      this.flush();

      this.assertJsonEquals({
        left: 0,
        top: 0,
        width: 110,
        height: 150
      }, container.bounds);

      this.assertEquals(0, c1.bounds.top);
      this.assertEquals(50, c2.bounds.top);
      this.assertEquals(100, c3.bounds.top);
    },


    testLargeChildInLine : function()
    {
      var layout = new qx.ui.layout.Flow();
      var container = this._container = new qx.test.ui.layout.LayoutItem(100, null).set({
        layout: layout
      });
      this.root.add(container);

      var c1 = new qx.test.ui.layout.LayoutItem(150, 50);
      container.add(c1);
      var c2 = new qx.test.ui.layout.LayoutItem(80, 50);
      container.add(c2);

      this.flush();

      this.assertEquals(0, c1.bounds.top);
      this.assertEquals(0, c1.bounds.left);
      this.assertEquals(50, c2.bounds.top);
    }
  },

  destruct : function() {
    this.root = null;
  }
});
