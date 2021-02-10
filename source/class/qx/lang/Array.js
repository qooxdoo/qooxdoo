/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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

   * Underscore.js
     http://underscorejs.org

     Copyright:
       2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

************************************************************************ */

/**
 * Static helper functions for arrays with a lot of often used convenience
 * methods like <code>remove</code> or <code>contains</code>.
 *
 * The native JavaScript Array is not modified by this class. However,
 * there are modifications to the native Array in {@link qx.lang.normalize.Array} for
 * browsers that do not support certain JavaScript features natively .
 *
 * @ignore(qx.data)
 * @ignore(qx.data.IListData)
 * @ignore(qx.Class.*)
 * @require(qx.lang.normalize.Date)
 */
qx.Bootstrap.define("qx.lang.Array",
{
  statics :
  {
    /**
     * Converts an array like object to any other array like
     * object.
     *
     * Attention: The returned array may be same
     * instance as the incoming one if the constructor is identical!
     *
     * @param object {var} any array-like object
     * @param constructor {Function} constructor of the new instance
     * @param offset {Integer?0} position to start from
     * @return {Array} the converted array
     */
    cast : function(object, constructor, offset)
    {
      if (object.constructor === constructor) {
        return object;
      }

      if (qx.data && qx.data.IListData) {
        if (qx.Class && qx.Class.hasInterface(object, qx.data.IListData)) {
          var object = object.toArray();
        }
      }


      // Create from given constructor
      var ret = new constructor;

      // Some collections in mshtml are not able to be sliced.
      // These lines are a special workaround for this client.
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        if (object.item)
        {
          for (var i=offset||0, l=object.length; i<l; i++) {
            ret.push(object[i]);
          }

          return ret;
        }
      }

      // Copy over items
      if (Object.prototype.toString.call(object) === "[object Array]" && offset == null) {
        ret.push.apply(ret, object);
      } else {
        ret.push.apply(ret, Array.prototype.slice.call(object, offset||0));
      }

      return ret;
    },


    /**
     * Convert an arguments object into an array.
     *
     * @param args {arguments} arguments object
     * @param offset {Integer?0} position to start from
     * @return {Array} a newly created array (copy) with the content of the arguments object.
     */
    fromArguments : function(args, offset) {
      return Array.prototype.slice.call(args, offset||0);
    },


    /**
     * Convert a (node) collection into an array
     *
     * @param coll {var} node collection
     * @return {Array} a newly created array (copy) with the content of the node collection.
     */
    fromCollection : function(coll)
    {
      // The native Array.slice cannot be used with some Array-like objects
      // including NodeLists in older IEs
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
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
      var result = qx.lang.Array.clone(input);

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
     * Return a copy of the given array
     *
     * @param arr {Array} the array to copy
     * @return {Array} copy of the array
     */
    clone : function(arr) {
      return arr.concat();
    },


    /**
     * Insert an element at a given position into the array
     *
     * @param arr {Array} the array
     * @param obj {var} the element to insert
     * @param i {Integer} position where to insert the element into the array
     * @return {Array} the array
     */
    insertAt : function(arr, obj, i)
    {
      arr.splice(i, 0, obj);

      return arr;
    },


    /**
     * Insert an element into the array before a given second element.
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} the array
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
     * Insert an element into the array after a given second element.
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} the array
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
     * Remove an element from the array at the given index
     *
     * @param arr {Array} the array
     * @param i {Integer} index of the element to be removed
     * @return {var} The removed element.
     */
    removeAt : function(arr, i) {
      return arr.splice(i, 1)[0];
    },


    /**
     * Remove all elements from the array
     *
     * @param arr {Array} the array
     * @return {Array} empty array
     */
    removeAll : function(arr)
    {
      arr.length = 0;
      return this;
    },


    /**
     * Append the elements of an array to the array
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be appended to other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    append : function(arr1, arr2)
    {
      if (arr1 instanceof qx.data.Array) {
        return arr1.append(arr2);
      }
      if (arr2 instanceof qx.data.Array) {
        arr2 = arr2.toArray();
      }
      
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      }

      Array.prototype.push.apply(arr1, arr2);
      return arr1;
    },


    /**
     * Modifies the first array as it removes all elements
     * which are listed in the second array as well.
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be excluded from the other one
     * @return {Array} The modified array.
     * @throws {Error} if one of the arguments is not an array
     */
    exclude : function(arr1, arr2)
    {
      if (arr1 instanceof qx.data.Array) {
        return arr1.exclude(arr2);
      }
      
      // this check is important because opera throws an uncatchable error if apply is called without
      // an arr as second argument.
      if (qx.core.Environment.get("qx.debug"))
      {
        qx.core.Assert && qx.core.Assert.assertArray(arr1, "The first parameter must be an array.");
        qx.core.Assert && qx.core.Assert.assertArray(arr2, "The second parameter must be an array.");
      }

      arr2.forEach(function(item) {
        var index = arr1.indexOf(item);
        if (index != -1) {
          arr1.splice(index, 1);
        }
      });

      return arr1;
    },


    /**
     * Remove an element from the array.
     *
     * @param arr {Array} the array
     * @param obj {var} element to be removed from the array
     * @return {var} the removed element
     */
    remove : function(arr, obj)
    {
      if (arr instanceof qx.data.Array) {
        return arr.remove(obj);
      }
      
      var i = arr.indexOf(obj);

      if (i != -1)
      {
        arr.splice(i, 1);
        return obj;
      }
    },

    /**
     * Whether the array contains the given element
     *
     * @deprecated {6.0} Please use Array instance include method instead
     *
     * @param arr {Array} the array
     * @param obj {var} object to look for
     * @return {Boolean} whether the arr contains the element
     */
    contains : function(arr, obj) {
      return arr.includes(obj);
    },

    /**
     * Check whether the two arrays have the same content. Checks only the
     * equality of the arrays' content.
     *
     * @param arr1 {Array} first array
     * @param arr2 {Array} second array
     * @return {Boolean} Whether the two arrays are equal
     */
    equals : function(arr1, arr2)
    {
      if (arr1 instanceof qx.data.Array) {
        return arr1.equals(arr2);
      }
      arr2 = qx.lang.Array.toNativeArray(arr2);
      
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
     * Returns the sum of all values in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number} The sum of all values.
     */
    sum : function(arr)
    {
      var result = 0;
      for (var i=0, l=arr.length; i<l; i++) {
        if (arr[i] != undefined) {
          result += arr[i];
        }
      }

      return result;
    },


    /**
     * Returns the highest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The highest of all values or undefined if array is empty.
     */
    max : function(arr)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
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
     * Returns the lowest value in the given array. Supports
     * numeric values only.
     *
     * @param arr {Number[]} Array to process
     * @return {Number | null} The lowest of all values or undefined if array is empty.
     */
    min : function(arr)
    {
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert && qx.core.Assert.assertArray(arr, "Parameter must be an array.");
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
     * Recreates an array which is free of all duplicate elements from the original.
     *
     * This method does not modify the original array!
     *
     * Keep in mind that this methods deletes undefined indexes.
     *
     * @param arr {Array} Incoming array
     * @return {Array} Returns a copy with no duplicates
     */
    unique: function(arr)
    {
      var ret=[], doneStrings={}, doneNumbers={}, doneObjects={};
      var value, count=0;
      var key = "qx" + Date.now();
      var hasNull=false, hasFalse=false, hasTrue=false;

      // Rebuild array and omit duplicates
      for (var i=0, len=arr.length; i<len; i++)
      {
        value = arr[i];

        // Differ between null, primitives and reference types
        if (value === null)
        {
          if (!hasNull)
          {
            hasNull = true;
            ret.push(value);
          }
        }
        else if (value === undefined)
        {
          // pass
        }
        else if (value === false)
        {
          if (!hasFalse)
          {
            hasFalse = true;
            ret.push(value);
          }
        }
        else if (value === true)
        {
          if (!hasTrue)
          {
            hasTrue = true;
            ret.push(value);
          }
        }
        else if (typeof value === "string")
        {
          if (!doneStrings[value])
          {
            doneStrings[value] = 1;
            ret.push(value);
          }
        }
        else if (typeof value === "number")
        {
          if (!doneNumbers[value])
          {
            doneNumbers[value] = 1;
            ret.push(value);
          }
        }
        else
        {
          var hash = value[key];

          if (hash == null) {
            hash = value[key] = count++;
          }

          if (!doneObjects[hash])
          {
            doneObjects[hash] = value;
            ret.push(value);
          }
        }
      }

      // Clear object hashs
      for (var hash in doneObjects)
      {
        try
        {
          delete doneObjects[hash][key];
        }
        catch(ex)
        {
          try
          {
            doneObjects[hash][key] = null;
          }
          catch(ex1)
          {
            throw new Error("Cannot clean-up map entry doneObjects[" + hash + "][" + key + "]");
          }
        }
      }

      return ret;
    },

    /**
     * Returns a new array with integers from start to stop incremented or decremented by step.
     *
     * @param start {Integer} start of the new array, defaults to 0
     * @param stop {Integer} stop of the new array
     * @param step {Integer} increment / decrement - depends whether you use positive or negative values
     * @return {Array} Returns a new array with integers
     */
    range : function(start, stop, step)
    {
      if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
      }
      step = arguments[2] || 1;

      var length = Math.max(Math.ceil((stop - start) / step), 0);
      var idx = 0;
      var range = Array(length);

      while (idx < length) {
        range[idx++] = start;
        start += step;
      }

      return range;
    },
    
    
    /**
     * Replaces the contents of the array `dest`
     * 
     * @param dest {Array|qx.data.Array} the array to edit (if null then a new array is created)
     * @param src {Array|qx.data.Array} the array to copy from, or null
     * @return {Array} the edited array (or the new array, if dest is null)
     */
    replace: function(dest, src) {
      if (dest instanceof qx.data.Array) {
        return dest.replace(src);
      }
      
      if (src === null) {
        if (dest === null) {
          return null;
        } else {
          return [];
        }
      }
      
      src = qx.lang.Array.toNativeArray(src);
      if (dest === null) {
        dest = src.slice(0);
      } else {
        var args = [ 0, dest.length ];
        src.forEach(function(item) {
          args.push(item);
        });
        dest.splice.apply(dest, args);
      }
      return dest;
    },
    
    
    /**
     * Returns a native array from src where possible; qx.data.Array is converted to its native array,
     * in which case unless `clone` parameter is set to true the rules of qx.data.Array.toArray should 
     * be followed, ie that the array should not be manipulated directly.
     * 
     * @param src {qx.data.Array|Array} the object to return as an array
     * @param clone{Boolean?} whether to make the returned array a clone, ie editable by the calling code
     * @return {Array}
     */
    toNativeArray: function(src, clone) {
      if (src === undefined || src === null) {
        return src;
      }
      if (src instanceof qx.data.Array) {
        if (clone) {
          return src.toArray().slice(0);
        }
        return src.toArray();
      }
      if (qx.lang.Type.isArray(src)) {
        if (clone) {
          return src.slice(0);
        }
        return src;
      }
      return [ src ];
    }
  }
});
