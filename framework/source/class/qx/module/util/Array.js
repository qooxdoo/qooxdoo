/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * Utility module to give some support to work with arrays.
 *
 * @group (Utilities)
 */
qx.Bootstrap.define("qx.module.util.Array", {
  statics : {
     /**
      * Converts an array like object to any other array like
      * object.
      *
      * Attention: The returned array may be same
      * instance as the incoming one if the constructor is identical!
      *
      * @signature function(object, constructor, offset)
      * @attachStatic {qxWeb, array.cast}
      *
      * @param object {var} any array-like object
      * @param constructor {Function} constructor of the new instance
      * @param offset {Number?0} position to start from
      * @return {Array} the converted array
      */
    cast : qx.lang.Array.cast,


    /**
     * Check whether the two arrays have the same content. Checks only the
     * equality of the arrays' content.
     *
     * @signature function(arr1, arr2)
     * @attachStatic {qxWeb, array.equals}
     *
     * @param arr1 {Array} first array
     * @param arr2 {Array} second array
     * @return {Boolean} Whether the two arrays are equal
     */
    equals : qx.lang.Array.equals,


    /**
     * Modifies the first array as it removes all elements
     * which are listed in the second array as well.
     *
     * @signature function(arr1, arr2)
     * @attachStatic {qxWeb, array.exclude}
     *
     * @param arr1 {Array} the array
     * @param arr2 {Array} the elements of this array will be excluded from the other one
     * @return {Array} The modified array.
     */
    exclude : qx.lang.Array.exclude,


    /**
     * Convert an arguments object into an array.
     *
     * @signature function(args, offset)
     * @attachStatic {qxWeb, array.fromArguments}
     *
     * @param args {arguments} arguments object
     * @param offset {Number?0} position to start from
     * @return {Array} a newly created array (copy) with the content of the arguments object.
     */
    fromArguments : qx.lang.Array.fromArguments,


    /**
     * Insert an element into the array after a given second element.
     *
     * @signature function(arr, obj, obj2)
     * @attachStatic {qxWeb, array.insertAfter}
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 after this object
     * @return {Array} The given array.
     */
    insertAfter : qx.lang.Array.insertAfter,


    /**
     * Insert an element into the array before a given second element.
     *
     * @signature function(arr, obj, obj2)
     * @attachStatic {qxWeb, array.insertBefore}
     *
     * @param arr {Array} the array
     * @param obj {var} object to be inserted
     * @param obj2 {var} insert obj1 before this object
     * @return {Array} The given array.
     */
    insertBefore : qx.lang.Array.insertBefore,


    /**
     * Returns the highest value in the given array. Supports
     * numeric values only.
     *
     * @signature function(arr)
     * @attachStatic {qxWeb, array.max}
     *
     * @param arr {Array} Array to process.
     * @return {Number | undefined} The highest of all values or undefined if array is empty.
     */
    max : qx.lang.Array.max,


    /**
     * Returns the lowest value in the given array. Supports
     * numeric values only.
     *
     * @signature function(arr)
     * @attachStatic {qxWeb, array.min}
     *
     * @param arr {Array} Array to process.
     * @return {Number | undefined} The lowest of all values or undefined if array is empty.
     */
    min : qx.lang.Array.min,


    /**
     * Remove an element from the array.
     *
     * @signature function(arr, obj)
     * @attachStatic {qxWeb, array.remove}
     *
     * @param arr {Array} the array
     * @param obj {var} element to be removed from the array
     * @return {var} the removed element
     */
    remove : qx.lang.Array.remove,


    /**
     * Remove all elements from the array
     *
     * @signature function(arr)
     * @attachStatic {qxWeb, array.removeAll}
     *
     * @param arr {Array} the array
     * @return {Array} empty array
     */
    removeAll : qx.lang.Array.removeAll,


    /**
     * Recreates an array which is free of all duplicate elements from the original.
     * This method do not modifies the original array!
     * Keep in mind that this methods deletes undefined indexes.
     *
     * @signature function(arr)
     * @attachStatic {qxWeb, array.unique}
     *
     * @param arr {Array} Incoming array
     * @return {Array} Returns a copy with no duplicates
     *   or the original array if no duplicates were found.
     */
    unique : qx.lang.Array.unique,

    /**
     * Returns a new array with integers from start to stop incremented or decremented by step.
     *
     * @signature function(start, stop, step)
     * @attachStatic {qxWeb, array.range}
     *
     * @param start {Integer} start of the new array, defaults to 0
     * @param stop {Integer} stop of the new array
     * @param step {Integer} increment / decrement - depends whether you use positive or negative values
     * @return {Array} Returns a new array with integers
     */
    range : qx.lang.Array.range
  },


  defer : function(statics) {
   qxWeb.$attachAll(this, "array");
  }
});
