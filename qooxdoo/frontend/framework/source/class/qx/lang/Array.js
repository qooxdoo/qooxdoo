/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Helper functions for arrays.
 *
 * The native JavaScript Array is not modified by this class. However,
 * there are modifications to the native Array in {@link qx.lang.Core} for
 * browsers that do not support certain JavaScript 1.6 features natively .
 *
 * The string/arr generics introduced in JavaScript 1.6 are supported by
 * {@link qx.lang.Generics}.
 */
qx.Bootstrap.define("qx.lang.Array",
{
  statics :
  {
    /**
     * Convert an arguments object into an arr
     *
     * @type static
     * @param args {arguments} arguments object
     * @param offset {Integer?0} position to start from
     * @return {Array} a newly created arr (copy) with the content of the arguments object.
     */
    fromArguments : function(args, offset) {
      return Array.prototype.slice.call(args, offset||0);
    },


    /**
     * Convert a (node) collection into an arr
     *
     * @type static
     * @param coll {var} node collection
     * @return {Array} a newly created arr (copy) with the content of the node collection.
     */
    fromCollection : function(coll)
    {
      // Some collection is mshtml are not able to be sliced.
      // This lines are a special workaround for this client.
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
      	if (coll.item)
      	{
      		var arr = [];
      		for (var i=0, l=coll.length; i<l; i++) {
      		  arr[i] = coll[i];
      		}

      		return arr;
      	}
      }

      return Array.prototype.slice.call(coll, 0);
    },


    /**
     * Expand shorthand definition to a four element list.
     * This is an utility function for padding/margin and all other shorthand handling.
     *
     * @type static
     * @param input {Array} arr with one to four elements
     * @return {Array} an arr with four elements
     */
    fromShortHand : function(input)
    {
      var len = input.length;
      var result = qx.lang.Array.copy(input);

      // Copy Values (according to the length)
      switch(len)
      {
        case 1:
          result[1] = result[2] = result[3] = result[0];
          break;

        case 2:
          result[2] = result[0];
          // no break here

        case 3:
          result[3] = result[1];
      }

      // Return list with 4 items
      return result;
    },


    /**
     * Return a copy of the given arr
     *
     * @type static
     * @param arr {Array} the arr to copy
     * @return {Array} copy of the arr
     */
    copy : function(arr) {
      return arr.concat();
    },


    /**
     * Return a copy of the given arr
     * The same as {@link qx.lang.Array#copy}
     *
     * @type static
     * @param arr {Array} the arr to copy
     * @return {Array} copy of the arr
     */
    clone : function(arr) {
      return arr.concat();
    },


    /**
     * Return the last element of an arr
     *
     * @type static
     * @param arr {Array} the arr
     * @return {var} the last element of the arr
     */
    getLast : function(arr) {
      return arr[arr.length - 1];
    },


    /**
     * Return the first element of an arr
     *
     * @type static
     * @param arr {Array} the arr
     * @return {var} the first element of the arr
     */
    getFirst : function(arr) {
      return arr[0];
    },


    /**
     * Insert an element at a given position into the arr
     *
     * @type static
     * @param arr {Array} the arr
     * @param obj {var} the element to insert
     * @param i {Integer} position where to insert the element into the arr
     * @return {Array} the arr
     */
    insertAt : function(arr, obj, i)
    {
      arr.splice(i, 0, obj);

      return arr;
    },


    /**
     * Insert an element into the arr before a given second element
     *
     * @type static
     * @param arr {Array} the arr
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} the arr
     */
    insertBefore : function(arr, obj, obj2)
    {
      var i = arr.indexOf(obj2);

      if (i == -1) {
        arr.push(obj);
      } else {
        arr.splice(i, 0, obj);
      }

      return arr;
    },


    /**
     * Insert an element into the arr after a given second element
     *
     * @type static
     * @param arr {Array} the arr
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} the arr
     */
    insertAfter : function(arr, obj, obj2)
    {
      var i = arr.indexOf(obj2);

      if (i == -1 || i == (arr.length - 1)) {
        arr.push(obj);
      } else {
        arr.splice(i + 1, 0, obj);
      }

      return arr;
    },


    /**
     * Remove an element from the arr at the given index
     *
     * @type static
     * @param arr {Array} the arr
     * @param i {Integer} index of the element to be removed
     * @return {var} The removed element.
     */
    removeAt : function(arr, i) {
      return arr.splice(i, 1)[0];
    },


    /**
     * Remmove all elements from the arr
     *
     * @type static
     * @param arr {Array} the arr
     * @return {Array} empty arr
     */
    removeAll : function(arr) {
      return arr.length = 0;
    },


    /**
     * Append the elements of an arr to the arr
     *
     * @type static
     * @param arr {Array} the arr
     * @param a {Array} the elements of this arr will be appended to the arr
     * @return {Array} The modified arr.
     * @throws an exception if the second argument is not an arr
     */
    append : function(arr, a)
    {
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!(typeof (a) == "object" && a instanceof Array)) {
          throw new Error("The second parameter must be an arr!");
        }
      }

      Array.prototype.push.apply(arr, a);

      return arr;
    },


    /**
     * Remove an element from the arr
     *
     * @type static
     * @param arr {Array} the arr
     * @param obj {var} element to be removed from the arr
     * @return {var} the removed element
     */
    remove : function(arr, obj)
    {
      var i = arr.indexOf(obj);

      if (i != -1)
      {
        arr.splice(i, 1);
        return obj;
      }
    },


    /**
     * Whether the arr contains the given element
     *
     * @type static
     * @param arr {Array} the arr
     * @param obj {var} object to look for
     * @return {Boolean} whether the arr contains the element
     */
    contains : function(arr, obj) {
      return arr.indexOf(obj) !== -1;
    },


    /**
     * Check whether the two arr have the same content. Checks only the
     * equality of the arrays' content.
     *
     * @param array1 {Array} first arr
     * @param array2 {Array} second arr
     * @return {Boolean} Whether the two arrays are equal
     */
    equals : function(arr1, arr2)
    {
      var length = arr1.length;

      if (length !== arr2.length) {
        return false;
      }

      for (var i=0; i<length; i++)
      {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }

      return true;
    },


    /**
     * Returns the sum of all values in the given arr. Supports
     * numeric values only.
     *
     * @type static
     * @param arr {Number[]} Array to process
     * @return {Number} The sum of all values.
     */
    sum : function(arr)
    {
      var result = 0;
      for (var i=0, l=arr.length; i<l; i++) {
        result += arr[i];
      }

      return result;
    },


    /**
     * Returns the highest value in the given arr. Supports
     * numeric values only.
     *
     * @type static
     * @param arr {Number[]} Array to process
     * @return {Number} The highest of all values.
     */
    max : function(arr)
    {
      var result = Number.MIN_VALUE;

      for (var i=0, l=arr.length; i<l; i++)
      {
        if (arr[i] > result) {
          result = arr[i];
        }
      }

      return result;
    },


    /**
     * Returns the lowest value in the given arr. Supports
     * numeric values only.
     *
     * @type static
     * @param arr {Number[]} Array to process
     * @return {Number} The lowest of all values.
     */
    min : function(arr)
    {
      var result = Number.MAX_VALUE;

      for (var i=0, l=arr.length; i<l; i++)
      {
        if (arr[i] < result) {
          result = arr[i];
        }
      }

      return result;
    },


    /**
     * Returns all elements which do no apply to given function.
     *
     * Opposite of {@link qx.lang.Array#findAll}
     *
     * @type static
     * @param arr {Array} Array to process
     * @param iterator {Function} Fuction which should be called for every element as parameter.
     * @param context {Object} Context in which the iterator should be called.
     * @return {Array} Array with all elements for which the given function returns false.
     */
    reject : function(arr, iterator, context)
    {
      var results = [];
      var fnc = (typeof(context) == "object") ? qx.lang.Function.bind(iterator, context) : iterator;

      for (var i=0, l=arr.length; i<l; i++)
      {
        if (!fnc(arr[i])) {
          results.push(arr[i]);
        }
      }

      return results;
    },


    /**
     * Returns all elements which apply to given function.
     *
     * Opposite of {@link qx.lang.Array#reject}
     *
     * @type static
     * @param arr {Array} Array to process
     * @param iterator {Function} Fuction which should be called for every element as parameter.
     * @param context {Object} Context in which the iterator should be called.
     * @return {Array} Array with all elements for which the given function returns true.
     */
    findAll : function(arr, iterator, context)
    {
      var results = [];
      var fnc = (typeof(context) == "object") ? qx.lang.Function.bind(iterator, context) : iterator;

      for (var i=0, l=arr.length; i<l; i++)
      {
        if (fnc(arr[i])) {
          results.push(arr[i]);
        }
      }

      return results;
    }
  }
});
