/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/* ************************************************************************
#require(qx.lang.normalize.Array)
************************************************************************ */
qx.Class.define("qx.test.lang.normalize.Array",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testIndexOf : function()
    {
      var obj = {};
      var arr = [1, obj, "str", 1];

      this.assertEquals(0, arr.indexOf(1));
      this.assertEquals(1, arr.indexOf(obj));
      this.assertEquals(2, arr.indexOf("str"));
      this.assertEquals(-1, arr.indexOf(0));
    },

    testLastIndexOf : function() {
      var obj = {};
      var arr = [1, obj, "str", 1];

      this.assertEquals(3, arr.lastIndexOf(1));
      this.assertEquals(1, arr.lastIndexOf(obj));
      this.assertEquals(2, arr.lastIndexOf("str"));
      this.assertEquals(-1, arr.lastIndexOf(0));
    },

    testForEach : function() {
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

    testFilter : function() {
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

    testMap : function() {
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

    testSome : function() {
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

    testEvery : function() {
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

    testReduce : function() {
      // TODO
    },

    testReduceRight : function() {
      // TODO
    }
  }
});