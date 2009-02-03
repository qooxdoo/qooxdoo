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
     
   ======================================================================

   This class contains code based on the following work:
     
   * jQuery
     http://jquery.com
     Version 1.3.1

     Copyright:
       2009 John Resig

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php         

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
     * Returns whether the given object is an array
     *
     * @param obj {Object} Any object
     * @return {Boolean} whether the given object is an array
     */    
    isArray: function(obj) 
    {
      // Normally the string compare is enough for all arrays 
      // (cross document), but all classes which extends Array e.g.
      // qx.core.BaseArray are identified as "[object Object]". The 
      // instanceof checks works though very well for them.
      return Object.prototype.toString.call(obj) === "[object Array]" || 
        obj instanceof Array;
    },
      

    /**
     * Convert an arguments object into an arr
     *
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
     * @param arr {Array} the arr to copy
     * @return {Array} copy of the arr
     */
    clone : function(arr) {
      return arr.concat();
    },


    /**
     * Return the last element of an arr. For performance reasons it is recommended 
     * to omit the function call and instead use <code>arr[arr.length - 1]</code>
     *
     * @param arr {Array} the arr
     * @return {var} the last element of the arr
     */
    getLast : function(arr) {
      return arr[arr.length - 1];
    },


    /**
     * Return the first element of an arr. For performance reasons it is recommended 
     * to omit the function call and instead use <code>arr[0]</code>
     *
     * @param arr {Array} the arr
     * @return {var} the first element of the arr
     */
    getFirst : function(arr) {
      return arr[0];
    },


    /**
     * Insert an element at a given position into the arr
     *
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
     * @param arr {Array} the arr
     * @return {Array} empty arr
     */
    removeAll : function(arr) {
      return arr.length = 0;
    },


    /**
     * Append the elements of an arr to the arr
     *
     * @param arr {Array} the arr
     * @param a {Array} the elements of this arr will be appended to the arr
     * @return {Array} The modified arr.
     * @throws an exception if the second argument is not an arr
     */
    append : function(arr, a)
    {
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertArray(a, "The second parameter must be an array.");
      }

      Array.prototype.push.apply(arr, a);

      return arr;
    },


    /**
     * Remove an element from the arr
     *
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
     * @param arr1 {Array} first arr
     * @param arr2 {Array} second arr
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
     * @param arr {Number[]} Array to process
     * @return {Number | null} The highest of all values or undefined if array is empty.
     */
    max : function(arr)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      }

      var i, len=arr.length, result = arr[0];

      for (i = 1; i < len; i++)
      {
        if (arr[i] > result) {
          result = arr[i];
        }
      }

      return result === undefined ? null : result;
    },


    /**
     * Returns the lowest value in the given arr. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The lowest of all values or undefined if array is empty.
     */
    min : function(arr)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.core.Assert.assertArray(arr, "Parameter must be an array.");
      }

      var i, len=arr.length, result = arr[0];

      for (i = 1; i < len; i++)
      {
        if (arr[i] < result) {
          result = arr[i];
        }
      }

      return result === undefined ? null : result;
    },
    
      
    /**
     * Remove all duplicate elements from an array of elements. Note that this 
     * only works on arrays of DOM elements, not strings or numbers.
     * 
     * Do not modifies the original array!
     *
     * @param arr {Array} Incoming array
     * @return {Array} Returns a copy with no duplicates or the original array if no duplicates were found
     */
    unique: function(arr) 
    {
      var ret=[], done={};
      var Registry = qx.core.ObjectRegistry;
  
      try 
      {
        // Rebuild array and omit duplicates
        for (var i=0, len=arr.length; i<len; i++) 
        {
          var id = Registry.toHashCode(arr[i]);  
          if (!done[id]) 
          {
            done[id] = true;
            ret.push(arr[i]);
          }
        }
        
        // Clear cached hash codes
        for (var i=0, len=ret.length; i<len; i++) {
          Registry.clearHashCode(ret[i]);
        }
        
        // Return the original if it is unmodified (reduce memory consumption)
        if (ret.length == arr.length) {
          return arr;
        }
      } 
      catch(e) 
      {
        ret = arr;
      }
  
      return ret;
    }  
  }
});
