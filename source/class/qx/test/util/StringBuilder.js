/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("qx.test.util.StringBuilder",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    setUp : function() {
      this.__sb = new qx.util.StringBuilder();
    },


    testAddGet : function() {
      this.__sb.add("1");
      this.__sb.add("2");
      this.assertEquals("12", this.__sb.get());
      this.__sb.add("3");
      this.assertEquals("123", this.__sb.get());
    },


    testSize : function() {
      this.__sb.add("123");
      this.assertEquals(3, this.__sb.size());
      this.__sb.add("4567");
      this.assertEquals(7, this.__sb.size());
    },


    testEmptyClear : function() {
      this.assertTrue(this.__sb.isEmpty());
      this.__sb.add("123");
      this.assertFalse(this.__sb.isEmpty());
      this.__sb.clear();
      this.assertTrue(this.__sb.isEmpty());
    }
  }
});

