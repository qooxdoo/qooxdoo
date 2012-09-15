/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/* ************************************************************************
#require(qx.lang.normalize.Object)
************************************************************************ */
qx.Class.define("qx.test.lang.normalize.Object",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],


  members :
  {
    testKeysWithExtendObject : function()
    {
      function ObjectA() {
        this.A = 10;
      };

      function ObjectB() {
        this.B = 11;
      };

      ObjectB.prototype = new ObjectA();

      var objB = new ObjectB();
      this.assertEquals(10, objB.A, "Object extension fails!");
      this.assertEquals(11, objB.B, "Object extension fails!");

      var keys = Object.keys(objB);
      this.assertEquals(1, keys.length, "Expected length wrong!");
      this.assertFalse(qx.lang.Array.contains(keys, "A"), "Test property A!");
      this.assertTrue(qx.lang.Array.contains(keys, "B"), "Test property B!");
    },


    testKeys : function() {
      var obj = {};
      obj.isPrototypeOf = function() {};
      obj.hasOwnProperty = function() {};
      obj.toLocaleString = function() {};
      obj.toString = function() {};
      obj.valueOf = function() {};
      obj.constructor = function() {};
      obj.prototype = function() {};

      var keys = Object.keys(obj);
      this.assertTrue(qx.lang.Array.contains(keys, "isPrototypeOf"), "Test isPrototypeOf");
      this.assertTrue(qx.lang.Array.contains(keys, "hasOwnProperty"), "Test hasOwnProperty");
      this.assertTrue(qx.lang.Array.contains(keys, "toLocaleString"), "Test toLocaleString");
      this.assertTrue(qx.lang.Array.contains(keys, "toString"), "Test toString");
      this.assertTrue(qx.lang.Array.contains(keys, "valueOf"), "Test valueOf");
      this.assertTrue(qx.lang.Array.contains(keys, "constructor"), "Test constructor");
      this.assertTrue(qx.lang.Array.contains(keys, "prototype"), "Test prototype");
    }
  }
});
