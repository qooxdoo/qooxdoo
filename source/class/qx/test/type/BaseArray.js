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

/**
 * @ignore(qx.test.type.TestArray)
 */

qx.Class.define("qx.test.type.BaseArray",
{
  extend : qx.dev.unit.TestCase,

  construct : function()
  {
    this.base(arguments);
    qx.Class.define("qx.test.type.TestArray", {
      extend : qx.type.BaseArray
    });
  },


  members :
  {
    testListConstruct : function()
    {
      var list = new qx.test.type.TestArray(10);
      this.assertEquals(10, list.length);

      list = new qx.test.type.TestArray(1, 2, 3);
      this.assertArrayEquals([1, 2, 3], list);
    },

    testSingleItemConstruct : function()
    {
      // ECMAScript version 3 compatible,
      // but NOT ECMAScript version 1
      var list = new qx.test.type.TestArray("42");
      this.assertArray(list);
      this.assertEquals(list.length, 1);
      this.assertIdentical("42", list[0], "The answer was not 42!");
    },

    testArrayLength : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertEquals(3, list.length);
    },

    testClear : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      list.length = 0;
      this.assertArrayEquals([], list);
    },

    testArrayJoin : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertEquals("1, 2, 3", list.join(", "));
    },

    testArrayConcat : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertArrayEquals([1, 2, 3, 4, 5], list.concat(4, 5));
      this.assertInstance(list.concat(4, 5), qx.test.type.TestArray);
    },

    testArrayPop : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      var popped = list.pop();
      this.assertEquals(3, popped);
      this.assertArrayEquals([1, 2], list);
    },

    testArrayPush : function()
    {
      var list = new qx.test.type.TestArray(1, 2);
      var length = list.push(3);
      this.assertEquals(3, length);
      this.assertArrayEquals([1, 2, 3], list);

      var length = list.push(4, 5);
      this.assertEquals(5, length);
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArrayReverse : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3, 4, 5);
      list.reverse();
      this.assertArrayEquals([5, 4, 3, 2, 1], list);
      list.reverse();
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArrayShift : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3, 4, 5);
      var shifted = list.shift();
      this.assertEquals(1, shifted);
      this.assertArrayEquals([2, 3, 4, 5], list);
    },

    testArrayUnshift : function()
    {
      var list = new qx.test.type.TestArray(2, 3, 4, 5);
      var length = list.unshift(1);
      this.assertArrayEquals([1, 2, 3, 4, 5], list);
    },

    testArraySlice : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3, 4, 5);
      this.assertArrayEquals([3, 4], list.slice(2, 4));
      this.assertArrayEquals([2, 3, 4, 5], list.slice(1));
      this.assertArrayEquals([3, 4], list.slice(2, -1));
      this.assertInstance(list.slice(2, 4), qx.test.type.TestArray);
    },

    testArraySort : function()
    {
      var list = new qx.test.type.TestArray(3, 5, 1, -1);
      var sorted = list.sort();
      this.assertArrayEquals([-1, 1, 3, 5], list);

      var list = new qx.test.type.TestArray(3, 5, 1, -1);
      var sorted = list.sort(function(a, b) {
        return a > b ? -1 : 1;
      });
      this.assertArrayEquals([5, 3, 1, -1], list);
    },

    testArraySplice : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3, 4, 5);
      var removed = list.splice(1, 2, 22, 33);
      this.assertArrayEquals([2, 3], removed);
      this.assertInstance(removed, qx.test.type.TestArray);
      this.assertArrayEquals([1, 22, 33, 4, 5], list);
    },

    testArrayToString : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertEquals(list.join(), list.toString());
    },

    testArrayToLocaleString : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertEquals([1, 2, 3].toLocaleString(), list.toLocaleString());
    },

    testArrayAccess : function()
    {
      var list = new qx.test.type.TestArray(1, 2, 3);
      this.assertEquals(1, list[0]);
      this.assertEquals(2, list[1]);
      this.assertEquals(3, list[2]);
    },

    testIndexOf : function()
    {
      var obj = {};
      var arr = new qx.test.type.TestArray(1, obj, "str", 1);

      this.assertEquals(0, arr.indexOf(1));
      this.assertEquals(1, arr.indexOf(obj));
      this.assertEquals(2, arr.indexOf("str"));
      this.assertEquals(-1, arr.indexOf(0));
    },

    testLastIndexOf : function()
    {
      var obj = {};
      var arr = new qx.test.type.TestArray(1, obj, "str", 1);

      this.assertEquals(3, arr.lastIndexOf(1));
      this.assertEquals(1, arr.lastIndexOf(obj));
      this.assertEquals(2, arr.lastIndexOf("str"));
      this.assertEquals(-1, arr.lastIndexOf(0));
    },

    testForEach : function()
    {
      var obj = {};
      var arr = new qx.test.type.TestArray(1, obj, "str", 1);

      var values = [];
      var indexes = [];
      arr.forEach(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3], indexes);
    },

    testFilter : function()
    {
      var arr = new qx.test.type.TestArray(1, 2, 3, 4);

      var values = [];
      var indexes = [];
      var odd = arr.filter(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);

        return index % 2 == 1;
      }, this);

      this.assertInstance(odd, qx.test.type.TestArray);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3], indexes);
      this.assertArrayEquals([2, 4], odd);
    },

    testMap : function()
    {
      var arr = new qx.test.type.TestArray(1, 2, 3, 4);

      var values = [];
      var indexes = [];
      var result = arr.map(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);

        return element + 1;
      }, this);

      this.assertInstance(result, qx.test.type.TestArray);
      this.assertArrayEquals([2, 3, 4, 5], result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3], indexes);
    },

    testSome : function()
    {
      var arr = new qx.test.type.TestArray(1, 2, 3, 4);

      var values = [];
      var indexes = [];
      var result = arr.some(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertFalse(result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3], indexes);

      this.assertTrue(arr.some(function(element) {
        return element == 3;
      }));

      this.assertFalse(arr.some(function(element, index) {
        return index == 6;
      }));
    },

    testEvery : function()
    {
      var arr = new qx.test.type.TestArray(1, 2, 3, 4);

      var values = [];
      var indexes = [];
      var result = arr.every(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
        return true;
      }, this);

      this.assertTrue(result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3], indexes);

      this.assertFalse(arr.every(function(element) {
        return element == 3;
      }));

      this.assertTrue(arr.every(function(element, index) {
        return element == index + 1;
      }));
    }
  }
});
