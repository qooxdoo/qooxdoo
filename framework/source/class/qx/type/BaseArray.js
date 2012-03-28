/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

   ======================================================================

   This class uses ideas and code snipplets presented at
   http://webreflection.blogspot.com/2008/05/habemus-array-unlocked-length-in-ie8.html
   http://webreflection.blogspot.com/2008/05/stack-and-arrayobject-how-to-create.html

   Author:
     Andrea Giammarchi

   License:
     MIT: http://www.opensource.org/licenses/mit-license.php

   ======================================================================

   This class uses documentation of the native Array methods from the MDC
   documentation of Mozilla.

   License:
     CC Attribution-Sharealike License:
     http://creativecommons.org/licenses/by-sa/2.5/

************************************************************************ */


/* ************************************************************************

#require(qx.lang.Core)
#require(qx.bom.client.Engine)

************************************************************************ */

/**
 * This class is the common superclass for most array classes in
 * qooxdoo. It supports all of the shiny 1.6 JavaScript array features
 * like <code>forEach</code> and <code>map</code>.
 *
 * This class may be instantiated instead of the native Array if
 * one wants to work with a feature-unified Array instead of the native
 * one. This class uses native features whereever possible but fills
 * all missing implementations with custom ones.
 *
 * Through the ability to extend from this class one could add even
 * more utility features on top of it.
 */
qx.Bootstrap.define("qx.type.BaseArray",
{
  extend : Array,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Array with the given length or the listed elements.
   *
   * <pre class="javascript">
   * var arr1 = new qx.type.BaseArray(arrayLength);
   * var arr2 = new qx.type.BaseArray(item0, item1, ..., itemN);
   * </pre>
   *
   * * <code>arrayLength</code>: The initial length of the array. You can access
   * this value using the length property. If the value specified is not a
   * number, an array of length 1 is created, with the first element having
   * the specified value. The maximum length allowed for an
   * array is 2^32-1, i.e. 4,294,967,295.
   * * <code>itemN</code>:  A value for the element in that position in the
   * array. When this form is used, the array is initialized with the specified
   * values as its elements, and the array's length property is set to the
   * number of arguments.
   *
   * @param length_or_items {Integer|varargs?null} The initial length of the array
   *        OR an argument list of values.
   */
  construct : function(length_or_items) {},


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Converts a base array to a native Array
     *
     * @signature function()
     * @return {Array} The native array
     */
    toArray : null,

    /**
     * Returns the current number of items stored in the Array
     *
     * @signature function()
     * @return {Integer} number of items
     */
    valueOf : null,

    /**
     * Removes the last element from an array and returns that element.
     *
     * This method modifies the array.
     *
     * @signature function()
     * @return {var} The last element of the array.
     */
    pop : null,

    /**
     * Adds one or more elements to the end of an array and returns the new length of the array.
     *
     * This method modifies the array.
     *
     * @signature function(varargs)
     * @param varargs {var} The elements to add to the end of the array.
     * @return {Integer} The new array's length
     */
    push : null,

    /**
     * Reverses the order of the elements of an array -- the first becomes the last, and the last becomes the first.
     *
     * This method modifies the array.
     *
     * @signature function()
     * @return {Array} Returns the modified array (works in place)
     */
    reverse : null,

    /**
     * Removes the first element from an array and returns that element.
     *
     * This method modifies the array.
     *
     * @signature function()
     * @return {var} The first element of the array.
     */
    shift : null,

    /**
     * Sorts the elements of an array.
     *
     * This method modifies the array.
     *
     * @signature function(compareFunction)
     * @param compareFunction {Function?null} Specifies a function that defines the sort order. If omitted,
     *   the array is sorted lexicographically (in dictionary order) according to the string conversion of each element.
     * @return {Array} Returns the modified array (works in place)
     */
    sort : null,

    /**
     * Adds and/or removes elements from an array.
     *
     * @signature function(index, howMany, varargs)
     * @param index {Integer} Index at which to start changing the array. If negative, will begin
     *   that many elements from the end.
     * @param howMany {Integer} An integer indicating the number of old array elements to remove.
     *   If <code>howMany</code> is 0, no elements are removed. In this case, you should specify
     *   at least one new element.
     * @param varargs {var?null} The elements to add to the array. If you don't specify any elements,
     *   splice simply removes elements from the array.
     * @return {BaseArray} New array with the removed elements.
     */
    splice : null,

    /**
     * Adds one or more elements to the front of an array and returns the new length of the array.
     *
     * This method modifies the array.
     *
     * @signature function(varargs)
     * @param varargs {var} The elements to add to the front of the array.
     * @return {Integer} The new array's length
     */
    unshift : null,

    /**
     * Returns a new array comprised of this array joined with other array(s) and/or value(s).
     *
     * This method does not modify the array and returns a modified copy of the original.
     *
     * @signature function(varargs)
     * @param varargs {Array|var} Arrays and/or values to concatenate to the resulting array.
     * @return {qx.type.BaseArray} New array built of the given arrays or values.
     */
    concat : null,

    /**
     * Joins all elements of an array into a string.
     *
     * @signature function(separator)
     * @param separator {String} Specifies a string to separate each element of the array. The separator is
     *   converted to a string if necessary. If omitted, the array elements are separated with a comma.
     * @return {String} The stringified values of all elements divided by the given separator.
     */
    join : null,

    /**
     * Extracts a section of an array and returns a new array.
     *
     * @signature function(begin, end)
     * @param begin {Integer} Zero-based index at which to begin extraction. As a negative index, start indicates
     *   an offset from the end of the sequence. slice(-2) extracts the second-to-last element and the last element
     *   in the sequence.
     * @param end {Integer?length} Zero-based index at which to end extraction. slice extracts up to but not including end.
     *   <code>slice(1,4)</code> extracts the second element through the fourth element (elements indexed 1, 2, and 3).
     *   As a negative index, end indicates an offset from the end of the sequence. slice(2,-1) extracts the third element through the second-to-last element in the sequence.
     *   If end is omitted, slice extracts to the end of the sequence.
     * @return {BaseArray} An new array which contains a copy of the given region.
     */
    slice : null,

    /**
     * Returns a string representing the array and its elements. Overrides the Object.prototype.toString method.
     *
     * @signature function()
     * @return {String} The string representation of the array.
     */
    toString : null,

    /**
     * Returns the first (least) index of an element within the array equal to the specified value, or -1 if none is found.
     *
     * @signature function(searchElement, fromIndex)
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer?0} The index at which to begin the search. Defaults to 0, i.e. the
     *   whole array will be searched. If the index is greater than or equal to the length of the
     *   array, -1 is returned, i.e. the array will not be searched. If negative, it is taken as
     *   the offset from the end of the array. Note that even when the index is negative, the array
     *   is still searched from front to back. If the calculated index is less than 0, the whole
     *   array will be searched.
     * @return {Integer} The index of the given element
     */
    indexOf : null,

    /**
     * Returns the last (greatest) index of an element within the array equal to the specified value, or -1 if none is found.
     *
     * @signature function(searchElement, fromIndex)
     * @param searchElement {var} Element to locate in the array.
     * @param fromIndex {Integer?length} The index at which to start searching backwards. Defaults to
     *   the array's length, i.e. the whole array will be searched. If the index is greater than
     *   or equal to the length of the array, the whole array will be searched. If negative, it
     *   is taken as the offset from the end of the array. Note that even when the index is
     *   negative, the array is still searched from back to front. If the calculated index is
     *   less than 0, -1 is returned, i.e. the array will not be searched.
     * @return {Integer} The index of the given element
     */
    lastIndexOf : null,

    /**
     * Executes a provided function once per array element.
     *
     * <code>forEach</code> executes the provided function (<code>callback</code>) once for each
     * element present in the array.  <code>callback</code> is invoked only for indexes of the array
     * which have assigned values; it is not invoked for indexes which have been deleted or which
     * have never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index
     * of the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>forEach</code>, it will be used
     * as the <code>this</code> for each invocation of the <code>callback</code>.  If it is not
     * provided, or is <code>null</code>, the global object associated with <code>callback</code>
     * is used instead.
     *
     * <code>forEach</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>forEach</code> is set before the first invocation of
     * <code>callback</code>.  Elements which are appended to the array after the call to
     * <code>forEach</code> begins will not be visited by <code>callback</code>. If existing elements
     * of the array are changed, or deleted, their value as passed to <code>callback</code> will be
     * the value at the time <code>forEach</code> visits them; elements that are deleted are not visited.
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to execute for each element.
     * @param obj {Object} Object to use as this when executing callback.
     */
    forEach : null,

    /**
     * Creates a new array with all elements that pass the test implemented by the provided
     * function.
     *
     * <code>filter</code> calls a provided <code>callback</code> function once for each
     * element in an array, and constructs a new array of all the values for which
     * <code>callback</code> returns a true value.  <code>callback</code> is invoked only
     * for indexes of the array which have assigned values; it is not invoked for indexes
     * which have been deleted or which have never been assigned values.  Array elements which
     * do not pass the <code>callback</code> test are simply skipped, and are not included
     * in the new array.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the
     * index of the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>filter</code>, it will
     * be used as the <code>this</code> for each invocation of the <code>callback</code>.
     * If it is not provided, or is <code>null</code>, the global object associated with
     * <code>callback</code> is used instead.
     *
     * <code>filter</code> does not mutate the array on which it is called. The range of
     * elements processed by <code>filter</code> is set before the first invocation of
     * <code>callback</code>. Elements which are appended to the array after the call to
     * <code>filter</code> begins will not be visited by <code>callback</code>. If existing
     * elements of the array are changed, or deleted, their value as passed to <code>callback</code>
     * will be the value at the time <code>filter</code> visits them; elements that are deleted
     * are not visited.
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to test each element of the array.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {BaseArray} The newly created array with all matching elements
     */
    filter : null,

    /**
     * Creates a new array with the results of calling a provided function on every element in this array.
     *
     * <code>map</code> calls a provided <code>callback</code> function once for each element in an array,
     * in order, and constructs a new array from the results.  <code>callback</code> is invoked only for
     * indexes of the array which have assigned values; it is not invoked for indexes which have been
     * deleted or which have never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
     * element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>map</code>, it will be used as the
     * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
     * <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>map</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>map</code> is set before the first invocation of
     * <code>callback</code>. Elements which are appended to the array after the call to <code>map</code>
     * begins will not be visited by <code>callback</code>.  If existing elements of the array are changed,
     * or deleted, their value as passed to <code>callback</code> will be the value at the time
     * <code>map</code> visits them; elements that are deleted are not visited.
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function produce an element of the new Array from an element of the current one.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {BaseArray} A new array which contains the return values of every item executed through the given function
     */
    map : null,

    /**
     * Tests whether some element in the array passes the test implemented by the provided function.
     *
     * <code>some</code> executes the <code>callback</code> function once for each element present in
     * the array until it finds one where <code>callback</code> returns a true value. If such an element
     * is found, <code>some</code> immediately returns <code>true</code>. Otherwise, <code>some</code>
     * returns <code>false</code>. <code>callback</code> is invoked only for indexes of the array which
     * have assigned values; it is not invoked for indexes which have been deleted or which have never
     * been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of the
     * element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>some</code>, it will be used as the
     * <code>this</code> for each invocation of the <code>callback</code>. If it is not provided, or is
     * <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>some</code> does not mutate the array on which it is called.
     *
     * The range of elements processed by <code>some</code> is set before the first invocation of
     * <code>callback</code>.  Elements that are appended to the array after the call to <code>some</code>
     * begins will not be visited by <code>callback</code>. If an existing, unvisited element of the array
     * is changed by <code>callback</code>, its value passed to the visiting <code>callback</code> will
     * be the value at the time that <code>some</code> visits that element's index; elements that are
     * deleted are not visited.
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to test for each element.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Boolean} Whether at least one elements passed the test
     */
    some : null,

    /**
     * Tests whether all elements in the array pass the test implemented by the provided function.
     *
     * <code>every</code> executes the provided <code>callback</code> function once for each element
     * present in the array until it finds one where <code>callback</code> returns a false value. If
     * such an element is found, the <code>every</code> method immediately returns <code>false</code>.
     * Otherwise, if <code>callback</code> returned a true value for all elements, <code>every</code>
     * will return <code>true</code>.  <code>callback</code> is invoked only for indexes of the array
     * which have assigned values; it is not invoked for indexes which have been deleted or which have
     * never been assigned values.
     *
     * <code>callback</code> is invoked with three arguments: the value of the element, the index of
     * the element, and the Array object being traversed.
     *
     * If a <code>obj</code> parameter is provided to <code>every</code>, it will be used as
     * the <code>this</code> for each invocation of the <code>callback</code>. If it is not provided,
     * or is <code>null</code>, the global object associated with <code>callback</code> is used instead.
     *
     * <code>every</code> does not mutate the array on which it is called. The range of elements processed
     * by <code>every</code> is set before the first invocation of <code>callback</code>. Elements which
     * are appended to the array after the call to <code>every</code> begins will not be visited by
     * <code>callback</code>.  If existing elements of the array are changed, their value as passed
     * to <code>callback</code> will be the value at the time <code>every</code> visits them; elements
     * that are deleted are not visited.
     *
     * @signature function(callback, obj)
     * @param callback {Function} Function to test for each element.
     * @param obj {Object} Object to use as <code>this</code> when executing <code>callback</code>.
     * @return {Boolean} Whether all elements passed the test
     */
    every : null
  }
});

(function() {

function createStackConstructor(stack)
{
  // In IE don't inherit from Array but use an empty object as prototype
  // and copy the methods from Array
  if ((qx.core.Environment.get("engine.name") == "mshtml"))
  {
    Stack.prototype = {
      length : 0,
      $$isArray : true
    };

    var args = "pop.push.reverse.shift.sort.splice.unshift.join.slice".split(".");

    for (var length = args.length; length;) {
      Stack.prototype[args[--length]] = Array.prototype[args[length]];
    }
  };

  // Remember Array's slice method
  var slice = Array.prototype.slice;

  // Fix "concat" method
  Stack.prototype.concat = function()
  {
    var constructor = this.slice(0);

    for (var i=0, length=arguments.length; i<length; i++)
    {
      var copy;

      if (arguments[i] instanceof Stack) {
        copy = slice.call(arguments[i], 0);
      } else if (arguments[i] instanceof Array) {
        copy = arguments[i];
      } else {
        copy = [arguments[i]];
      }

      constructor.push.apply(constructor, copy);
    }

    return constructor;
  };

  // Fix "toString" method
  Stack.prototype.toString = function(){
    return slice.call(this, 0).toString();
  };

  // Fix "toLocaleString"
  Stack.prototype.toLocaleString = function() {
    return slice.call(this, 0).toLocaleString();
  };

  // Fix constructor
  Stack.prototype.constructor = Stack;


  // Add JS 1.6 Array features
  Stack.prototype.indexOf = qx.lang.Core.arrayIndexOf;
  Stack.prototype.lastIndexOf = qx.lang.Core.arrayLastIndexOf;
  Stack.prototype.forEach = qx.lang.Core.arrayForEach;
  Stack.prototype.some = qx.lang.Core.arraySome;
  Stack.prototype.every = qx.lang.Core.arrayEvery;

  var filter = qx.lang.Core.arrayFilter;
  var map = qx.lang.Core.arrayMap;


  // Fix methods which generates a new instance
  // to return an instance of the same class
  Stack.prototype.filter = function()
  {
    var ret = new this.constructor;
    ret.push.apply(ret, filter.apply(this, arguments));
    return ret;
  };

  Stack.prototype.map = function()
  {
    var ret = new this.constructor;
    ret.push.apply(ret, map.apply(this, arguments));
    return ret;
  };

  Stack.prototype.slice = function()
  {
    var ret = new this.constructor;
    ret.push.apply(ret, Array.prototype.slice.apply(this, arguments));
    return ret;
  };

  Stack.prototype.splice = function()
  {
    var ret = new this.constructor;
    ret.push.apply(ret, Array.prototype.splice.apply(this, arguments));
    return ret;
  };

  // Add new "toArray" method for convert a base array to a native Array
  Stack.prototype.toArray = function() {
    return Array.prototype.slice.call(this, 0);
  };

  // Add valueOf() to return the length
  Stack.prototype.valueOf = function(){
    return this.length;
  };

  // Return final class
  return Stack;
}


function Stack(length)
{
  if(arguments.length === 1 && typeof length === "number") {
    this.length = -1 < length && length === length >> .5 ? length : this.push(length);
  } else if(arguments.length) {
    this.push.apply(this, arguments);
  }
};

function PseudoArray(){};
PseudoArray.prototype = [];
Stack.prototype = new PseudoArray;
Stack.prototype.length = 0;

qx.type.BaseArray = createStackConstructor(Stack);

})();
