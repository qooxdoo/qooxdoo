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

/**
 * @require(qx.lang.normalize.Object)
 */
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
      this.assertFalse(keys.includes("A"), "Test property A!");
      this.assertTrue(keys.includes("B"), "Test property B!");
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
      this.assertTrue(keys.includes("isPrototypeOf"), "Test isPrototypeOf");
      this.assertTrue(keys.includes("hasOwnProperty"), "Test hasOwnProperty");
      this.assertTrue(keys.includes("toLocaleString"), "Test toLocaleString");
      this.assertTrue(keys.includes("toString"), "Test toString");
      this.assertTrue(keys.includes("valueOf"), "Test valueOf");
      this.assertTrue(keys.includes("constructor"), "Test constructor");
      this.assertTrue(keys.includes("prototype"), "Test prototype");
    },

    testGetValues : function()
    {
      var object = {
        a: undefined,
        b: null,
        c: 1
      };
      this.assertArrayEquals(
        [undefined, null, 1].sort(),
        Object.values(object).sort()
      );

      var object = {};
      this.assertArrayEquals(
        [],
        Object.values(object)
      );

      var object = {
        "isPrototypeOf": 1,
        "hasOwnProperty": 2,
        "toLocaleString": 3,
        "toString": 4,
        "valueOf": 5
      };
      this.assertArrayEquals(
        [1, 2, 3, 4, 5].sort(),
        Object.values(object).sort()
      );
    }
  }
});
