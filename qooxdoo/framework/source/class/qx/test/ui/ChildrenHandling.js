/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Test widget children handling
 */
qx.Class.define("qx.test.ui.ChildrenHandling",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    assertArrayEquals : function(expected, found, msg)
    {
      this.assertArray(expected, msg);
      this.assertArray(found, msg);

      this.assertEquals(expected.length, found.length, msg);
      for (var i=0; i<expected.length; i++) {
        this.assertIdentical(expected[i], found[i], msg);
      }
    },


    _setChildren : function(parent, children)
    {
      parent.removeAll();

      for (var i=0; i<children.length; i++) {
        parent.add(children[i]);
      }

      qx.ui.core.queue.Manager.flush();
      this.assertArrayEquals(children, parent.getChildren());
    },


    testRemove : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var c1 = new qx.ui.core.Widget();
      var c2 = new qx.ui.core.Widget();
      var c3 = new qx.ui.core.Widget();

      var w1 = new qx.ui.core.Widget();

      var children = [c1, c2, c3];
      this._setChildren(parent, children);

      parent.remove(c1);
      this.assertArrayEquals([c2, c3], parent.getChildren(), "remove first");
      this._setChildren(parent, children);

      parent.remove(c2);
      this.assertArrayEquals([c1, c3], parent.getChildren(), "remove middle");
      this._setChildren(parent, children);

      parent.remove(c3);
      this.assertArrayEquals([c1, c2], parent.getChildren(), "remove last");
      this._setChildren(parent, children);

      parent.remove(w1);
      this.assertArrayEquals([c1, c2, c3], parent.getChildren(), "remove non child");
      this._setChildren(parent, children);

      c1.destroy();
      c2.destroy();
      c3.destroy();
      w1.destroy();
      parent.destroy();
    },


    testRemoveAt : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var c1 = new qx.ui.core.Widget();
      var c2 = new qx.ui.core.Widget();
      var c3 = new qx.ui.core.Widget();

      var w1 = new qx.ui.core.Widget();

      var children = [c1, c2, c3];


      this._setChildren(parent, children);
      parent.removeAt(0);
      this.assertArrayEquals([c2, c3], parent.getChildren(), "remove first");

      this._setChildren(parent, children);
      parent.removeAt(1);
      this.assertArrayEquals([c1, c3], parent.getChildren(), "remove middle");

      this._setChildren(parent, children);
      parent.removeAt(2);
      this.assertArrayEquals([c1, c2], parent.getChildren(), "remove last");

      if (this.isDebugOn())
      {
        this._setChildren(parent, children);
        this.assertException(function() {
          parent.removeAt(-1);
        }, qx.core.AssertionError, "", "remove at negative index");
      }

      if (this.isDebugOn())
      {
        this._setChildren(parent, children);
        this.assertException(function() {
          parent.removeAt(-1);
        }, qx.core.AssertionError, "", "remove at negative index");
      }

      c1.destroy();
      c2.destroy();
      c3.destroy();
      w1.destroy();
      parent.destroy();
    },


    testAddBefore : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var c1 = new qx.ui.core.Widget();
      var c2 = new qx.ui.core.Widget();
      var c3 = new qx.ui.core.Widget();

      var w1 = new qx.ui.core.Widget();
      var w2 = new qx.ui.core.Widget();

      var children = [c1, c2, c3];
      this._setChildren(parent, children);


      parent.addBefore(w1, c1);
      this.assertArrayEquals([w1, c1, c2, c3], parent.getChildren(), "add new widget at begin")
      this._setChildren(parent, children);

      parent.addBefore(w1, c3);
      this.assertArrayEquals([c1, c2, w1, c3], parent.getChildren(), "add new widget in the middle");
      this._setChildren(parent, children);

      if (this.isDebugOn())
      {
        var self = this;
        this.assertException(function() {
          parent.addBefore(w1, w2);
        }, qx.core.AssertionError, "", "add new widget before non child");
        this._setChildren(parent, children);
      }

      parent.addBefore(c1, c1);
      this.assertArrayEquals([c1, c2, c3], parent.getChildren(), "add existing before itself");
      this._setChildren(parent, children);

      parent.addBefore(c3, c1);
      this.assertArrayEquals([c3, c1, c2], parent.getChildren(), "add existing before first");
      this._setChildren(parent, children);

      parent.addBefore(c3, c2);
      this.assertArrayEquals([c1, c3, c2], parent.getChildren(), "add existing in the middle");
      this._setChildren(parent, children);

      if (this.isDebugOn())
      {
        var self = this;
        this.assertException(function() {
          parent.addBefore(c3, w2);
        }, qx.core.AssertionError, "", "add existing before non child");
        this._setChildren(parent, children);
      }

      c1.destroy();
      c2.destroy();
      c3.destroy();
      w1.destroy();
      w2.destroy();
      parent.destroy();
    },


    testAddAfter : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var c1 = new qx.ui.core.Widget();
      var c2 = new qx.ui.core.Widget();
      var c3 = new qx.ui.core.Widget();

      var w1 = new qx.ui.core.Widget();
      var w2 = new qx.ui.core.Widget();

      var children = [c1, c2, c3];
      this._setChildren(parent, children);


      parent.addAfter(w1, c3);
      this.assertArrayEquals([c1, c2, c3, w1], parent.getChildren(), "add new widget ar end")
      this._setChildren(parent, children);

      parent.addAfter(w1, c1);
      this.assertArrayEquals([c1, w1, c2, c3], parent.getChildren(), "add new widget in the middle");
      this._setChildren(parent, children);

      if (this.isDebugOn())
      {
        var self = this;
        this.assertException(function() {
          parent.addAfter(w1, w2);
        }, qx.core.AssertionError, "", "add new widget after non child");
        this._setChildren(parent, children);
      }

      parent.addAfter(c1, c1);
      this.assertArrayEquals([c1, c2, c3], parent.getChildren(), "add existing before itself");
      this._setChildren(parent, children);

      parent.addAfter(c1, c3);
      this.assertArrayEquals([c2, c3, c1], parent.getChildren(), "add existing before last");
      this._setChildren(parent, children);

      parent.addAfter(c1, c2);
      this.assertArrayEquals([c2, c1, c3], parent.getChildren(), "add existing in the middle");
      this._setChildren(parent, children);

      if (this.isDebugOn())
      {
        var self = this;
        this.assertException(function() {
          parent.addAfter(c1, w2);
        }, qx.core.AssertionError, "", "add existing after non child");
        this._setChildren(parent, children);
      }

      c1.destroy();
      c2.destroy();
      c3.destroy();
      w1.destroy();
      w2.destroy();
      parent.destroy();
    },


    testDoubleAdd : function()
    {
      var parent = new qx.ui.container.Composite(new qx.ui.layout.Basic());

      var children = [];
      for (var i=0; i<4; i++)
      {
        children[i] = new qx.ui.core.Widget();
        parent.add(children[i]);
      }

      this.assertArrayEquals(children, parent.getChildren());

      // double add must move the child to the end!
      var child = children[1];
      parent.add(child);
      qx.lang.Array.remove(children, child);
      children.push(child);
      this.assertArrayEquals(children, parent.getChildren());

      parent.destroy();
    }
  }
});