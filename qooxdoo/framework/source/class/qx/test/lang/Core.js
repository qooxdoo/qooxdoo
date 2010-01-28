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

qx.Class.define("qx.test.lang.Core",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testErrorToString : function()
    {
      var msg = "Dummer Fehler";
      var error = new Error(msg);
      this.assertTrue(qx.lang.String.contains(error.toString(), msg));
    },


    testArrayIndexOf : function()
    {
      var obj = {};
      var arr = [1, obj, "str", 1];

      this.assertEquals(0, arr.indexOf(1));
      this.assertEquals(1, arr.indexOf(obj));
      this.assertEquals(2, arr.indexOf("str"));
      this.assertEquals(-1, arr.indexOf(0));
    },

    testArrayLastIndexOf : function()
    {
      var obj = {};
      var arr = [1, obj, "str", 1];

      this.assertEquals(3, arr.lastIndexOf(1));
      this.assertEquals(1, arr.lastIndexOf(obj));
      this.assertEquals(2, arr.lastIndexOf("str"));
      this.assertEquals(-1, arr.lastIndexOf(0));
    },

    testArrayForEach : function()
    {
      var obj = {};
      var arr = [1, obj, "str", 1];
      arr[10] = 12;

      var values = [];
      var indexes = [];
      arr.forEach(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 10], indexes);
    },

    testArrayFilter : function()
    {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

      var values = [];
      var indexes = [];
      var odd = arr.filter(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);

        return index % 2 == 1;
      }, this);

      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 10], indexes);
      this.assertArrayEquals([2, 4], odd);
    },

    testArrayMap : function()
    {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

      var values = [];
      var indexes = [];
      var result = arr.map(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);

        return element + 1;
      }, this);

      var expected = [2, 3, 4, 5];
      expected[10] = 12;

      this.assertArrayEquals(expected, result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 10], indexes);
    },

    testArraySome : function()
    {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

      var values = [];
      var indexes = [];
      var result = arr.some(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertFalse(result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 10], indexes);

      this.assertTrue(arr.some(function(element) {
        return element == 3;
      }));

      this.assertFalse(arr.some(function(element, index) {
        return index == 6;
      }));
    },

    testArrayEvery : function()
    {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

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
      this.assertArrayEquals([0, 1, 2, 3, 10], indexes);

      this.assertFalse(arr.every(function(element) {
        return element == 3;
      }));

      this.assertTrue(arr.every(function(element, index) {
        return element == index + 1;
      }));
    },

    testArrayReduce : function()
    {
      // reduce Requires JavaScript 1.8
      // Apply a function simultaneously against two values of the array
      // (from left-to-right) as to reduce it to a single value.
      this.warn("Implement method!");
    },

    testArrayReduceRight : function()
    {
      // reduceRight Requires JavaScript 1.8
      // Apply a function simultaneously against two values of the array
      // (from right-to-left) as to reduce it to a single value.
      this.warn("Implement method!");
    },

    testStringQuote : function()
    {
      this.assertEquals('"abc \\"defg\\" hij"', 'abc "defg" hij'.quote());
      this.assertEquals('"abc \\\\defg\\\\ hij"', 'abc \\defg\\ hij'.quote());
      this.assertEquals('"abc \\"defg\\\\ hij"', 'abc "defg\\ hij'.quote());
    }
  }
});