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
 * @require(qx.lang.normalize.Array)
 */
qx.Class.define("qx.test.lang.normalize.Array",
{
  extend : qx.dev.unit.TestCase,
  include : [qx.dev.unit.MMock],


  members :
  {
    testShims: function() {
      var testArray = ["entry1", "entry2"];
      for (var index in testArray) {
        this.assertTrue(index == 0 || index == 1);
      }
    },
    
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

    testFind : function() {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

      var values = [];
      var indexes = [];
      var result = arr.find(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertUndefined(result);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], indexes);

      this.assertEquals(arr.find(function(element) {
        return element == 3;
      }), 3);

      this.assertUndefined(arr.find(function(element, index) {
        return index == 6;
      }));
    },

    testFindIndex : function() {
      var arr = [1, 2, 3, 4];
      arr[10] = 11;

      var values = [];
      var indexes = [];
      var result = arr.findIndex(function(element, index, array) {
        values[index] = element;
        indexes.push(index);
        this.assertEquals(arr, array);
      }, this);

      this.assertEquals(result, -1);
      this.assertArrayEquals(arr, values);
      this.assertArrayEquals([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], indexes);

      this.assertEquals(arr.findIndex(function(element) {
        return element == 3;
      }), 2);

      this.assertEquals(arr.findIndex(function(element, index) {
        return element == 6;
      }), -1);
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
      this.assertEquals(10, [].reduce(function() {}, 10));
      var spy = this.spy();
      [1].reduce(spy, 10);
      this.assertCalledWith(spy, 10, 1, 0, [1]);
      this.assertEquals(6, [1,2,3].reduce(function(a, b) {return a + b;}, 0));
      this.assertArrayEquals([0,1,2,3,4], [[1,2], [3,4]].reduce(
        function(a, b) {return a.concat(b);}, [0]
      ));
    },

    testReduceRight : function() {
      this.assertEquals(10, [].reduceRight(function() {}, 10));
      var spy = this.spy();
      [1].reduceRight(spy, 10);
      this.assertCalledWith(spy, 10, 1, 0, [1]);
      this.assertEquals(6, [1,2,3].reduceRight(function(a, b) {return a + b;}, 0));
      this.assertArrayEquals([0, 3,4,1,2], [[1,2], [3,4]].reduceRight(
        function(a, b) {return a.concat(b);}, [0]
      ));
    },

    testIncludes : function() {
      var arr = ['one', 'two', 'three'];
      this.assertTrue(arr.includes("one"), "includes does not work!");
      this.assertTrue(arr.includes("two"), "includes does not work!");
      this.assertTrue(arr.includes("three"), "includes does not work!");
      this.assertFalse(arr.includes("four"), "includes does not work!");

      arr = [NaN];
      this.assertTrue(arr.includes(NaN), "includes does not work!");

      arr = [];
      this.assertFalse(arr.includes("one"), "includes does not work!");
    }
  }
});
