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

qx.Class.define("qx.test.ui.core.SizeHint",
{
  extend : qx.dev.unit.TestCase,
  type : "abstract",

  members :
  {
    setUp : function() {
      this.widget = new qx.ui.core.Widget();
    },


    tearDown : function() {
      this.widget.dispose();
    },


    getHint : function()
    {
      this.widget.invalidateLayoutCache();
      return this.widget.getSizeHint();
    },


    assertHint : function(min, size, max) {
      throw new Error("abstract method call");
    },


    getDefaultSize : function() {
      throw new Error("abstract method call");
    },


    setSize : function(min, size, max) {
      throw new Error("abstract method call");
    },


    setStretching : function(shrink, grow) {
      throw new Error("abstract method call");
    },


    testDefaultSize : function() {
      this.assertHint(0, this.getDefaultSize(), Infinity);
    },


    testSize : function()
    {
      this.setStretching(true, true);
      this.setSize(null, 200, null);
      this.assertHint(0, 200, Infinity);
    },


    testMinLargerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(200, 100, null);
      this.assertHint(200, 200, Infinity);
    },


    testMinSmallerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(50, 150, null);
      this.assertHint(50, 150, Infinity);
    },


    testMaxSmallerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(null, 100, 10);
      this.assertHint(0, 10, 10);
    },


    testMaxLargerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(null, 100, 150);
      this.assertHint(0, 100, 150);
    },


    testNoGrow : function()
    {
      this.setStretching(true, false);
      this.setSize(null, 100, null);
      this.assertHint(0, 100, 100);
    },


    testNoShrink : function()
    {
      this.setStretching(false, true);
      this.setSize(null, 100, null);
      this.assertHint(100, 100, Infinity);
    },


    testNoStretch : function() {
      this.setStretching(false, false);
      this.setSize(null, 100, null);
      this.assertHint(100, 100, 100);
    },


    testNoGrowAndMaxLargerThanSize : function()
    {
      this.setStretching(true, false);
      this.setSize(null, 100, 150);
      this.assertHint(0, 100, 100);
    },


    testNoGrowAndMaxSmallerThanSize : function()
    {
      this.setStretching(true, false);
      this.setSize(null, 100, 50);
      this.assertHint(0, 50, 50);
    },


    testNoGrowAndMinLargerThanSize : function()
    {
      this.setStretching(true, false);
      this.setSize(150, 100, null);
      this.assertHint(150, 150, 150);
    },


    testNoShrinkAndMinLargerSize : function()
    {
      this.setStretching(false, true);
      this.setSize(150, 100, null);
      this.assertHint(150, 150, Infinity);
    },


    testNoShrinkAndMinSmallerSize : function()
    {
      this.setStretching(false, true);
      this.setSize(50, 100, null);
      this.assertHint(100, 100, Infinity);
    },


    testNoShrinkAndMaxSmallerSize : function()
    {
      this.setStretching(false, true);
      this.setSize(null, 100, 50);
      this.assertHint(50, 50, 50);
    },


    testMinLargerThanMax : function()
    {
      this.setStretching(true, true);
      this.setSize(200, 100, 150);
      if (this.isDebugOn())
      {
        var that = this;
        this.assertException(function() {
          that.getHint();
        }, qx.core.AssertionError);
      }
    },


    testMinAndMaxLargerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(150, 100, 200);
      this.assertHint(150, 150, 200);
    },


    testMinAndMaxSmallerThanSize : function()
    {
      this.setStretching(true, true);
      this.setSize(150, 300, 200);
      this.assertHint(150, 200, 200);
    }
  }
});
