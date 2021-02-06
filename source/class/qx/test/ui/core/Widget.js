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

/**
 * @ignore(qx.test.ui.core.W)
 */
qx.Class.define("qx.test.ui.core.Widget",
{
  extend : qx.test.ui.LayoutTestCase,
  include : [qx.dev.unit.MMock, qx.dev.unit.MRequirements],

  members :
  {
    testIsTabable : function()
    {
      var widget = new qx.ui.core.Widget().set({
        focusable: true
      });

      this.assertFalse(widget.isTabable(), "Non rendered widgets are not tabable");

      this.getRoot().add(widget);
      this.flush();
      this.assertTrue(widget.isTabable(), "Rendered focusable widgets are tabable");

      widget.setFocusable(false);
      this.assertFalse(widget.isTabable(), "Non focusable widgets are not tabable");

      widget.destroy();
    },


    testIsSeeableDepth0AfterFlush : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1AfterFlush : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      c.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2AfterFlush : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      cc.hide();
      this.flush();

      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth0 : function() {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);

      this.assertTrue(w.isSeeable());
      w.hide();
      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableDepth1 : function()
    {
      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      this.getRoot().add(c);
      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      c.hide();
      this.assertFalse(w.isSeeable());

      l.dispose();
      w.destroy();
      c.destroy();
    },


    testIsSeeableDepth2 : function()
    {
      var cc = new qx.ui.container.Composite();
      var ll = new qx.ui.layout.Canvas();
      cc.setLayout(ll);
      this.getRoot().add(cc);

      var c = new qx.ui.container.Composite();
      var l = new qx.ui.layout.Canvas();
      c.setLayout(l);
      cc.add(c);

      var w = new qx.ui.core.Widget();
      c.add(w);

      this.assertTrue(w.isSeeable());
      cc.hide();
      this.assertFalse(w.isSeeable());

      ll.dispose();
      cc.destroy();
      l.dispose();
      w.destroy();
      c.destroy();
    },

    testIsSeeableDepth0AfterFlushExclude : function()
    {
      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      this.flush();

      this.assertTrue(w.isSeeable());

      w.exclude();
      this.flush();

      this.assertFalse(w.isSeeable());

      w.destroy();
    },


    testIsSeeableNotInRoot : function()
    {
      var w = new qx.ui.core.Widget();
      this.assertFalse(w.isSeeable());
      w.destroy();
    },

    testScrollChildIntoViewChangesScheduled : function() {
      var msg,
          scrollPane,
          scrollTopInitial,
          scrollTop;

      var scroll = new qx.ui.container.Scroll().set({
        width: 100,
        height: 100
      });
      this.getRoot().add(scroll);

      var outer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      scroll.add(outer);

      var inner1 = new qx.ui.core.Widget().set({
        height: 100,
        backgroundColor: "red"
      });
      outer.add(inner1);

      var inner2 = new qx.ui.core.Widget().set({
        height: 20,
        backgroundColor: "green"
      });
      outer.add(inner2);

      scrollPane = scroll._getChildren()[0];

      // Scroll and flush
      scroll.scrollChildIntoView(inner2);
      this.flush();
      scrollTopInitial = scrollPane.getContentElement().getDomElement().scrollTop;

      // Scroll, do not flush
      inner1.setHeight(200);
      scroll.scrollChildIntoView(inner2);

      qx.event.Timer.once(function() {
        scrollTop = scrollPane.getContentElement().getDomElement().scrollTop;
      }, this, 250);

      this.wait(500, function() {
        msg = "Must scroll further down, but was: " + scrollTopInitial + " is: " + scrollTop;
        this.assert(scrollTop > scrollTopInitial, msg);
        scroll.destroy();
      }, this);

    },

    testLazyScrollChildIntoViewY : function()
    {
      var scroll = new qx.ui.container.Scroll().set({
        width: 100,
        height: 100
      });
      this.getRoot().add(scroll);

      var outer = new qx.ui.container.Composite(new qx.ui.layout.VBox());
      scroll.add(outer);

      var inner1 = new qx.ui.core.Widget().set({
        height: 150,
        backgroundColor: "red"
      });
      outer.add(inner1);

      var inner2 = new qx.ui.core.Widget().set({
        height: 20,
        backgroundColor: "green"
      });
      outer.add(inner2);

      var scrollTop = null;

      var listener1 = scroll.addListener("disappear", function(ev) {
        var child = this.getChildren()[0].getChildren()[1];
        this.scrollChildIntoView(child);
        this.setVisibility("visible");
      });

      var listener2 = scroll.addListener("appear", function(ev) {
        var scrollPane = this._getChildren()[0];
        scrollTop = scrollPane.getContentElement().getDomElement().scrollTop;
      });

      qx.event.Timer.once(function() {
        scroll.setVisibility("hidden");
      }, this, 250);

      this.wait(1000, function() {
        this.assert(scrollTop > 0, "Child was not scrolled!");
        scroll.removeListenerById(listener1);
        scroll.removeListenerById(listener2);
        scroll.destroy();
      }, this);
    },


    testReleaseChildControl : function() {
      qx.Class.define("qx.test.ui.core.W", {
        extend : qx.ui.core.Widget,

        members : {
          _createChildControlImpl: function(id) {
            return new qx.ui.core.Widget();
          }
        }
      });

      var w = new qx.test.ui.core.W();

      var child = w.getChildControl("xyz");
      this.flush();
      this.assertEquals(w._getCreatedChildControls()["xyz"], child);

      w._releaseChildControl("xyz");
      this.assertUndefined(w._getCreatedChildControls()["xyz"]);

      child.dispose();
      w.dispose();
      qx.Class.undefine("qx.test.ui.core.W");
    },

    testChildGetSubcontrolId : function() {
      qx.Class.define("qx.test.ui.core.W", {
        extend : qx.ui.core.Widget,

        members : {
          _createChildControlImpl : function(id, hash)
          {
            var control;
      
            switch(id)
            {
              case "xyz":
                control = new qx.ui.core.Widget();
                break;
      
            }
      
            return control || this.base(arguments, id);
          }
        }
      });

      var w = new qx.test.ui.core.W();

      var child = w.getChildControl("xyz");
      this.flush();
      this.assertEquals("xyz", child.getSubcontrolId());
      
      this.assertNull(w.getSubcontrolId());

      child.dispose();
      w.dispose();
      qx.Class.undefine("qx.test.ui.core.W");
    },


    testCreateChildControlHash: function(){
      qx.Class.define("qx.test.ui.core.W", {
        extend : qx.ui.core.Widget,

        members : {
          _createChildControlImpl: function(id, hash) {
            this.test = id + "-" + hash;
            return this;
          }
        }
      });

      var w = new qx.test.ui.core.W();

      w.getChildControl("affe#afffe");
      this.assertEquals("affe-afffe", w.test);

      w.getChildControl("affe#afffe#juhu");
      this.assertEquals("affe-afffe#juhu", w.test);

      w.dispose();
      qx.Class.undefine("qx.test.ui.core.W");
    },


    testComputeSizeHintMinWidthBiggerMax : function() {
      var w = new qx.ui.core.Widget();
      w.setMaxWidth(100);

      this.stub(w, "_getContentHint").returns({
        minWidth : 200
      });

      var hint = w._computeSizeHint();

      this.assertEquals(100, hint.minWidth);
      w.dispose();
    },


    testComputeSizeHintMinHeightBiggerMax : function() {
      var w = new qx.ui.core.Widget();
      w.setMaxHeight(100);

      this.stub(w, "_getContentHint").returns({
        minHeight : 200
      });

      var hint = w._computeSizeHint();

      this.assertEquals(100, hint.minHeight);
      w.dispose();
    },


    testComputeSizeHintMaxWidthSmallerMin : function() {
      var w = new qx.ui.core.Widget();
      w.setMinWidth(200);

      this.stub(w, "_getContentHint").returns({
        maxWidth : 100
      });

      var hint = w._computeSizeHint();

      this.assertEquals(200, hint.maxWidth);
      w.dispose();
    },


    testComputeSizeHintMaxHeightSmallerMin : function() {
      var w = new qx.ui.core.Widget();
      w.setMinHeight(200);

      this.stub(w, "_getContentHint").returns({
        maxHeight : 100
      });

      var hint = w._computeSizeHint();

      this.assertEquals(200, hint.maxHeight);
      w.dispose();
    },


    testAddUndefined : function() {
      this.require(["qx.debug"]);

      var w = new qx.ui.core.Widget();

      this.assertException(function(){
        w._add(undefined);
      },
      qx.core.AssertionError.constructor,
      /Expected value to be instanceof 'qx.ui.core.LayoutItem'/
      );

      w.dispose();
    },


    testAddNoWidget : function() {
      this.require(["qx.debug"]);

      var w = new qx.ui.core.Widget();

      this.assertException(function(){
        w._add(new qx.bom.Font());
      },
      qx.core.AssertionError.constructor,
      /Expected value to be instanceof 'qx.ui.core.LayoutItem'/
      );

      w.dispose();
    },


    testAddWidget : function() {
      this.require(["qx.debug"]);

      var w = new qx.ui.core.Widget();
      w._add(new qx.ui.container.Composite());

      w.dispose();
    }
  }
});
