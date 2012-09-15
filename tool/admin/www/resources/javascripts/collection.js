qx.$$packageData['0']={"locales":{},"resources":{},"translations":{}};
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
     * Sebastian Werner (swerner)
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
qx.Class.define("qx.type.BaseArray",
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
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008-2010 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Andreas Ecker (ecker)

   ======================================================================

   This class contains code based on the following work:

   * Sizzle CSS Selector Engine - v1.5.1

     Homepage:
       http://sizzlejs.com/

     Documentation:
       http://wiki.github.com/jeresig/sizzle

     Discussion:
       http://groups.google.com/group/sizzlejs

     Code:
       http://github.com/jeresig/sizzle/tree

     Copyright:
       (c) 2009, The Dojo Foundation

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

   ----------------------------------------------------------------------

     Copyright (c) 2009 John Resig

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation files
     (the "Software"), to deal in the Software without restriction,
     including without limitation the rights to use, copy, modify, merge,
     publish, distribute, sublicense, and/or sell copies of the Software,
     and to permit persons to whom the Software is furnished to do so,
     subject to the following conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
     DEALINGS IN THE SOFTWARE.

   ----------------------------------------------------------------------

     Version:
       Snapshot taken on 2011-03-15, latest Sizzle commit on 2011-02-18:
       commit  ef19279f54ba49242c6461d47577c703f4f4e80e

************************************************************************ */

/**
 * The selector engine supports virtually all CSS 3 Selectors  – this even
 * includes some parts that are infrequently implemented such as escaped
 * selectors (<code>.foo\\+bar</code>), Unicode selectors, and results returned
 * in document order. There are a few notable exceptions to the CSS 3 selector
 * support:
 *
 * * <code>:root</code>
 * * <code>:target</code>
 * * <code>:nth-last-child</code>
 * * <code>:nth-of-type</code>
 * * <code>:nth-last-of-type</code>
 * * <code>:first-of-type</code>
 * * <code>:last-of-type</code>
 * * <code>:only-of-type</code>
 * * <code>:lang()</code>
 *
 * In addition to the CSS 3 Selectors the engine supports the following
 * additional selectors or conventions.
 *
 * *Changes*
 *
 * * <code>:not(a.b)</code>: Supports non-simple selectors in <code>:not()</code> (most browsers only support <code>:not(a)</code>, for example).
 * * <code>:not(div > p)</code>: Supports full selectors in <code>:not()</code>.
 * * <code>:not(div, p)</code>: Supports multiple selectors in <code>:not()</code>.
 * * <code>[NAME=VALUE]</code>: Doesn't require quotes around the specified value in an attribute selector.
 *
 * *Additions*
 *
 * * <code>[NAME!=VALUE]</code>: Finds all elements whose <code>NAME</code> attribute doesn't match the specified value. Is equivalent to doing <code>:not([NAME=VALUE])</code>.
 * * <code>:contains(TEXT)</code>: Finds all elements whose textual context contains the word <code>TEXT</code> (case sensitive).
 * * <code>:header</code>: Finds all elements that are a header element (h1, h2, h3, h4, h5, h6).
 * * <code>:parent</code>: Finds all elements that contains another element.
 *
 * *Positional Selector Additions*
 *
 * * <code>:first</code>/</code>:last</code>: Finds the first or last matching element on the page. (e.g. <code>div:first</code> would find the first div on the page, in document order)
 * * <code>:even</code>/<code>:odd</code>: Finds every other element on the page (counting begins at 0, so <code>:even</code> would match the first element).
 * * <code>:eq</code>/<code>:nth</code>: Finds the Nth element on the page (e.g. <code>:eq(5)</code> finds the 6th element on the page).
 * * <code>:lt</code>/<code>:gt</code>: Finds all elements at positions less than or greater than the specified positions.
 *
 * *Form Selector Additions*
 *
 * * <code>:input</code>: Finds all input elements (includes textareas, selects, and buttons).
 * * <code>:text</code>, <code>:checkbox</code>, <code>:file</code>, <code>:password</code>, <code>:submit</code>, <code>:image</code>, <code>:reset</code>, <code>:button</code>: Finds the input element with the specified input type (<code>:button</code> also finds button elements).
 *
 * Based on Sizzle by John Resig, see:
 *
 * * http://sizzlejs.com/
 *
 * For further usage details also have a look at the wiki page at:
 *
 * * http://wiki.github.com/jeresig/sizzle
 */
qx.Class.define("qx.bom.Selector",
{
  statics :
  {
    /**
     * Queries the document for the given selector. Supports all CSS3 selectors
     * plus some extensions as mentioned in the class description.
     *
     * @signature function(selector, context)
     * @param selector {String} Valid selector (CSS3 + extensions)
     * @param context {Element} Context element (result elements must be children of this element)
     * @return {Array} Matching elements
     */
    query : null,

    /**
     * Returns an reduced array which only contains the elements from the given
     * array which matches the given selector
     *
     * @signature function(selector, set)
     * @param selector {String} Selector to filter given set
     * @param set {Array} List to filter according to given selector
     * @return {Array} New array containing matching elements
     */
    matches : null
  }
});


/**
 * Below is the original Sizzle code. Snapshot date is mentioned in the head of
 * this file.
 */

/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
  done = 0,
  toString = Object.prototype.toString,
  hasDuplicate = false,
  baseHasDuplicate = true,
  rBackslash = /\\/g,
  rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
  baseHasDuplicate = false;
  return 0;
});

var Sizzle = function( selector, context, results, seed ) {
  results = results || [];
  context = context || document;

  var origContext = context;

  if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
    return [];
  }

  if ( !selector || typeof selector !== "string" ) {
    return results;
  }

  var m, set, checkSet, extra, ret, cur, pop, i,
    prune = true,
    contextXML = Sizzle.isXML( context ),
    parts = [],
    soFar = selector;

  // Reset the position of the chunker regexp (start from head)
  do {
    chunker.exec( "" );
    m = chunker.exec( soFar );

    if ( m ) {
      soFar = m[3];

      parts.push( m[1] );

      if ( m[2] ) {
        extra = m[3];
        break;
      }
    }
  } while ( m );

  if ( parts.length > 1 && origPOS.exec( selector ) ) {

    if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
      set = posProcess( parts[0] + parts[1], context );

    } else {
      set = Expr.relative[ parts[0] ] ?
        [ context ] :
        Sizzle( parts.shift(), context );

      while ( parts.length ) {
        selector = parts.shift();

        if ( Expr.relative[ selector ] ) {
          selector += parts.shift();
        }

        set = posProcess( selector, set );
      }
    }

  } else {
    // Take a shortcut and set the context if the root selector is an ID
    // (but not if it'll be faster if the inner selector is an ID)
    if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
        Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

      ret = Sizzle.find( parts.shift(), context, contextXML );
      context = ret.expr ?
        Sizzle.filter( ret.expr, ret.set )[0] :
        ret.set[0];
    }

    if ( context ) {
      ret = seed ?
        { expr: parts.pop(), set: makeArray(seed) } :
        Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

      set = ret.expr ?
        Sizzle.filter( ret.expr, ret.set ) :
        ret.set;

      if ( parts.length > 0 ) {
        checkSet = makeArray( set );

      } else {
        prune = false;
      }

      while ( parts.length ) {
        cur = parts.pop();
        pop = cur;

        if ( !Expr.relative[ cur ] ) {
          cur = "";
        } else {
          pop = parts.pop();
        }

        if ( pop == null ) {
          pop = context;
        }

        Expr.relative[ cur ]( checkSet, pop, contextXML );
      }

    } else {
      checkSet = parts = [];
    }
  }

  if ( !checkSet ) {
    checkSet = set;
  }

  if ( !checkSet ) {
    Sizzle.error( cur || selector );
  }

  if ( toString.call(checkSet) === "[object Array]" ) {
    if ( !prune ) {
      results.push.apply( results, checkSet );

    } else if ( context && context.nodeType === 1 ) {
      for ( i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
          results.push( set[i] );
        }
      }

    } else {
      for ( i = 0; checkSet[i] != null; i++ ) {
        if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
          results.push( set[i] );
        }
      }
    }

  } else {
    makeArray( checkSet, results );
  }

  if ( extra ) {
    Sizzle( extra, origContext, results, seed );
    Sizzle.uniqueSort( results );
  }

  return results;
};

Sizzle.uniqueSort = function( results ) {
  if ( sortOrder ) {
    hasDuplicate = baseHasDuplicate;
    results.sort( sortOrder );

    if ( hasDuplicate ) {
      for ( var i = 1; i < results.length; i++ ) {
        if ( results[i] === results[ i - 1 ] ) {
          results.splice( i--, 1 );
        }
      }
    }
  }

  return results;
};

Sizzle.matches = function( expr, set ) {
  return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
  return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
  var set;

  if ( !expr ) {
    return [];
  }

  for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
    var match,
      type = Expr.order[i];

    if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
      var left = match[1];
      match.splice( 1, 1 );

      if ( left.substr( left.length - 1 ) !== "\\" ) {
        match[1] = (match[1] || "").replace( rBackslash, "" );
        set = Expr.find[ type ]( match, context, isXML );

        if ( set != null ) {
          expr = expr.replace( Expr.match[ type ], "" );
          break;
        }
      }
    }
  }

  if ( !set ) {
    set = typeof context.getElementsByTagName !== "undefined" ?
      context.getElementsByTagName( "*" ) :
      [];
  }

  return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
  var match, anyFound,
    old = expr,
    result = [],
    curLoop = set,
    isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

  while ( expr && set.length ) {
    for ( var type in Expr.filter ) {
      if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
        var found, item,
          filter = Expr.filter[ type ],
          left = match[1];

        anyFound = false;

        match.splice(1,1);

        if ( left.substr( left.length - 1 ) === "\\" ) {
          continue;
        }

        if ( curLoop === result ) {
          result = [];
        }

        if ( Expr.preFilter[ type ] ) {
          match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

          if ( !match ) {
            anyFound = found = true;

          } else if ( match === true ) {
            continue;
          }
        }

        if ( match ) {
          for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
            if ( item ) {
              found = filter( item, match, i, curLoop );
              var pass = not ^ !!found;

              if ( inplace && found != null ) {
                if ( pass ) {
                  anyFound = true;

                } else {
                  curLoop[i] = false;
                }

              } else if ( pass ) {
                result.push( item );
                anyFound = true;
              }
            }
          }
        }

        if ( found !== undefined ) {
          if ( !inplace ) {
            curLoop = result;
          }

          expr = expr.replace( Expr.match[ type ], "" );

          if ( !anyFound ) {
            return [];
          }

          break;
        }
      }
    }

    // Improper expression
    if ( expr === old ) {
      if ( anyFound == null ) {
        Sizzle.error( expr );

      } else {
        break;
      }
    }

    old = expr;
  }

  return curLoop;
};

Sizzle.error = function( msg ) {
  throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
  order: [ "ID", "NAME", "TAG" ],

  match: {
    ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
    CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
    NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
    ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
    TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
    CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
    POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
    PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
  },

  leftMatch: {},

  attrMap: {
    "class": "className",
    "for": "htmlFor"
  },

  attrHandle: {
    href: function( elem ) {
      return elem.getAttribute( "href" );
    },
    type: function( elem ) {
      return elem.getAttribute( "type" );
    }
  },

  relative: {
    "+": function(checkSet, part){
      var isPartStr = typeof part === "string",
        isTag = isPartStr && !rNonWord.test( part ),
        isPartStrNotTag = isPartStr && !isTag;

      if ( isTag ) {
        part = part.toLowerCase();
      }

      for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
        if ( (elem = checkSet[i]) ) {
          while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

          checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
            elem || false :
            elem === part;
        }
      }

      if ( isPartStrNotTag ) {
        Sizzle.filter( part, checkSet, true );
      }
    },

    ">": function( checkSet, part ) {
      var elem,
        isPartStr = typeof part === "string",
        i = 0,
        l = checkSet.length;

      if ( isPartStr && !rNonWord.test( part ) ) {
        part = part.toLowerCase();

        for ( ; i < l; i++ ) {
          elem = checkSet[i];

          if ( elem ) {
            var parent = elem.parentNode;
            checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
          }
        }

      } else {
        for ( ; i < l; i++ ) {
          elem = checkSet[i];

          if ( elem ) {
            checkSet[i] = isPartStr ?
              elem.parentNode :
              elem.parentNode === part;
          }
        }

        if ( isPartStr ) {
          Sizzle.filter( part, checkSet, true );
        }
      }
    },

    "": function(checkSet, part, isXML){
      var nodeCheck,
        doneName = done++,
        checkFn = dirCheck;

      if ( typeof part === "string" && !rNonWord.test( part ) ) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck;
      }

      checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
    },

    "~": function( checkSet, part, isXML ) {
      var nodeCheck,
        doneName = done++,
        checkFn = dirCheck;

      if ( typeof part === "string" && !rNonWord.test( part ) ) {
        part = part.toLowerCase();
        nodeCheck = part;
        checkFn = dirNodeCheck;
      }

      checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
    }
  },

  find: {
    ID: function( match, context, isXML ) {
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);
        // Check parentNode to catch when Blackberry 4.6 returns
        // nodes that are no longer in the document #6963
        return m && m.parentNode ? [m] : [];
      }
    },

    NAME: function( match, context ) {
      if ( typeof context.getElementsByName !== "undefined" ) {
        var ret = [],
          results = context.getElementsByName( match[1] );

        for ( var i = 0, l = results.length; i < l; i++ ) {
          if ( results[i].getAttribute("name") === match[1] ) {
            ret.push( results[i] );
          }
        }

        return ret.length === 0 ? null : ret;
      }
    },

    TAG: function( match, context ) {
      if ( typeof context.getElementsByTagName !== "undefined" ) {
        return context.getElementsByTagName( match[1] );
      }
    }
  },
  preFilter: {
    CLASS: function( match, curLoop, inplace, result, not, isXML ) {
      match = " " + match[1].replace( rBackslash, "" ) + " ";

      if ( isXML ) {
        return match;
      }

      for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
        if ( elem ) {
          if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
            if ( !inplace ) {
              result.push( elem );
            }

          } else if ( inplace ) {
            curLoop[i] = false;
          }
        }
      }

      return false;
    },

    ID: function( match ) {
      return match[1].replace( rBackslash, "" );
    },

    TAG: function( match, curLoop ) {
      return match[1].replace( rBackslash, "" ).toLowerCase();
    },

    CHILD: function( match ) {
      if ( match[1] === "nth" ) {
        if ( !match[2] ) {
          Sizzle.error( match[0] );
        }

        match[2] = match[2].replace(/^\+|\s*/g, '');

        // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
        var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
          match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
          !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

        // calculate the numbers (first)n+(last) including if they are negative
        match[2] = (test[1] + (test[2] || 1)) - 0;
        match[3] = test[3] - 0;
      }
      else if ( match[2] ) {
        Sizzle.error( match[0] );
      }

      // TODO: Move to normal caching system
      match[0] = done++;

      return match;
    },

    ATTR: function( match, curLoop, inplace, result, not, isXML ) {
      var name = match[1] = match[1].replace( rBackslash, "" );

      if ( !isXML && Expr.attrMap[name] ) {
        match[1] = Expr.attrMap[name];
      }

      // Handle if an un-quoted value was used
      match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

      if ( match[2] === "~=" ) {
        match[4] = " " + match[4] + " ";
      }

      return match;
    },

    PSEUDO: function( match, curLoop, inplace, result, not ) {
      if ( match[1] === "not" ) {
        // If we're dealing with a complex expression, or a simple one
        if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
          match[3] = Sizzle(match[3], null, null, curLoop);

        } else {
          var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

          if ( !inplace ) {
            result.push.apply( result, ret );
          }

          return false;
        }

      } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
        return true;
      }

      return match;
    },

    POS: function( match ) {
      match.unshift( true );

      return match;
    }
  },

  filters: {
    enabled: function( elem ) {
      return elem.disabled === false && elem.type !== "hidden";
    },

    disabled: function( elem ) {
      return elem.disabled === true;
    },

    checked: function( elem ) {
      return elem.checked === true;
    },

    selected: function( elem ) {
      // Accessing this property makes selected-by-default
      // options in Safari work properly
      if ( elem.parentNode ) {
        elem.parentNode.selectedIndex;
      }

      return elem.selected === true;
    },

    parent: function( elem ) {
      return !!elem.firstChild;
    },

    empty: function( elem ) {
      return !elem.firstChild;
    },

    has: function( elem, i, match ) {
      return !!Sizzle( match[3], elem ).length;
    },

    header: function( elem ) {
      return (/h\d/i).test( elem.nodeName );
    },

    text: function( elem ) {
      // IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc)
      // use getAttribute instead to test this case
      return "text" === elem.getAttribute( 'type' );
    },
    radio: function( elem ) {
      return "radio" === elem.type;
    },

    checkbox: function( elem ) {
      return "checkbox" === elem.type;
    },

    file: function( elem ) {
      return "file" === elem.type;
    },
    password: function( elem ) {
      return "password" === elem.type;
    },

    submit: function( elem ) {
      return "submit" === elem.type;
    },

    image: function( elem ) {
      return "image" === elem.type;
    },

    reset: function( elem ) {
      return "reset" === elem.type;
    },

    button: function( elem ) {
      return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
    },

    input: function( elem ) {
      return (/input|select|textarea|button/i).test( elem.nodeName );
    }
  },
  setFilters: {
    first: function( elem, i ) {
      return i === 0;
    },

    last: function( elem, i, match, array ) {
      return i === array.length - 1;
    },

    even: function( elem, i ) {
      return i % 2 === 0;
    },

    odd: function( elem, i ) {
      return i % 2 === 1;
    },

    lt: function( elem, i, match ) {
      return i < match[3] - 0;
    },

    gt: function( elem, i, match ) {
      return i > match[3] - 0;
    },

    nth: function( elem, i, match ) {
      return match[3] - 0 === i;
    },

    eq: function( elem, i, match ) {
      return match[3] - 0 === i;
    }
  },
  filter: {
    PSEUDO: function( elem, match, i, array ) {
      var name = match[1],
        filter = Expr.filters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );

      } else if ( name === "contains" ) {
        return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

      } else if ( name === "not" ) {
        var not = match[3];

        for ( var j = 0, l = not.length; j < l; j++ ) {
          if ( not[j] === elem ) {
            return false;
          }
        }

        return true;

      } else {
        Sizzle.error( name );
      }
    },

    CHILD: function( elem, match ) {
      var type = match[1],
        node = elem;

      switch ( type ) {
        case "only":
        case "first":
          while ( (node = node.previousSibling) )   {
            if ( node.nodeType === 1 ) {
              return false;
            }
          }

          if ( type === "first" ) {
            return true;
          }

          node = elem;

        case "last":
          while ( (node = node.nextSibling) )   {
            if ( node.nodeType === 1 ) {
              return false;
            }
          }

          return true;

        case "nth":
          var first = match[2],
            last = match[3];

          if ( first === 1 && last === 0 ) {
            return true;
          }

          var doneName = match[0],
            parent = elem.parentNode;

          if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
            var count = 0;

            for ( node = parent.firstChild; node; node = node.nextSibling ) {
              if ( node.nodeType === 1 ) {
                node.nodeIndex = ++count;
              }
            }

            parent.sizcache = doneName;
          }

          var diff = elem.nodeIndex - last;

          if ( first === 0 ) {
            return diff === 0;

          } else {
            return ( diff % first === 0 && diff / first >= 0 );
          }
      }
    },

    ID: function( elem, match ) {
      return elem.nodeType === 1 && elem.getAttribute("id") === match;
    },

    TAG: function( elem, match ) {
      return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
    },

    CLASS: function( elem, match ) {
      return (" " + (elem.className || elem.getAttribute("class")) + " ")
        .indexOf( match ) > -1;
    },

    ATTR: function( elem, match ) {
      var name = match[1],
        result = Expr.attrHandle[ name ] ?
          Expr.attrHandle[ name ]( elem ) :
          elem[ name ] != null ?
            elem[ name ] :
            elem.getAttribute( name ),
        value = result + "",
        type = match[2],
        check = match[4];

      return result == null ?
        type === "!=" :
        type === "=" ?
        value === check :
        type === "*=" ?
        value.indexOf(check) >= 0 :
        type === "~=" ?
        (" " + value + " ").indexOf(check) >= 0 :
        !check ?
        value && result !== false :
        type === "!=" ?
        value !== check :
        type === "^=" ?
        value.indexOf(check) === 0 :
        type === "$=" ?
        value.substr(value.length - check.length) === check :
        type === "|=" ?
        value === check || value.substr(0, check.length + 1) === check + "-" :
        false;
    },

    POS: function( elem, match, i, array ) {
      var name = match[2],
        filter = Expr.setFilters[ name ];

      if ( filter ) {
        return filter( elem, i, match, array );
      }
    }
  }
};

var origPOS = Expr.match.POS,
  fescape = function(all, num){
    return "\\" + (num - 0 + 1);
  };

for ( var type in Expr.match ) {
  Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
  Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
  array = Array.prototype.slice.call( array, 0 );

  if ( results ) {
    results.push.apply( results, array );
    return results;
  }

  return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
  Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch( e ) {
  makeArray = function( array, results ) {
    var i = 0,
      ret = results || [];

    if ( toString.call(array) === "[object Array]" ) {
      Array.prototype.push.apply( ret, array );

    } else {
      if ( typeof array.length === "number" ) {
        for ( var l = array.length; i < l; i++ ) {
          ret.push( array[i] );
        }

      } else {
        for ( ; array[i]; i++ ) {
          ret.push( array[i] );
        }
      }
    }

    return ret;
  };
}

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
  sortOrder = function( a, b ) {
    if ( a === b ) {
      hasDuplicate = true;
      return 0;
    }

    if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
      return a.compareDocumentPosition ? -1 : 1;
    }

    return a.compareDocumentPosition(b) & 4 ? -1 : 1;
  };

} else {
  sortOrder = function( a, b ) {
    var al, bl,
      ap = [],
      bp = [],
      aup = a.parentNode,
      bup = b.parentNode,
      cur = aup;

    // The nodes are identical, we can exit early
    if ( a === b ) {
      hasDuplicate = true;
      return 0;

    // If the nodes are siblings (or identical) we can do a quick check
    } else if ( aup === bup ) {
      return siblingCheck( a, b );

    // If no parents were found then the nodes are disconnected
    } else if ( !aup ) {
      return -1;

    } else if ( !bup ) {
      return 1;
    }

    // Otherwise they're somewhere else in the tree so we need
    // to build up a full list of the parentNodes for comparison
    while ( cur ) {
      ap.unshift( cur );
      cur = cur.parentNode;
    }

    cur = bup;

    while ( cur ) {
      bp.unshift( cur );
      cur = cur.parentNode;
    }

    al = ap.length;
    bl = bp.length;

    // Start walking down the tree looking for a discrepancy
    for ( var i = 0; i < al && i < bl; i++ ) {
      if ( ap[i] !== bp[i] ) {
        return siblingCheck( ap[i], bp[i] );
      }
    }

    // We ended someplace up the tree so do a sibling check
    return i === al ?
      siblingCheck( a, bp[i], -1 ) :
      siblingCheck( ap[i], b, 1 );
  };

  siblingCheck = function( a, b, ret ) {
    if ( a === b ) {
      return ret;
    }

    var cur = a.nextSibling;

    while ( cur ) {
      if ( cur === b ) {
        return -1;
      }

      cur = cur.nextSibling;
    }

    return 1;
  };
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
  var ret = "", elem;

  for ( var i = 0; elems[i]; i++ ) {
    elem = elems[i];

    // Get the text from text nodes and CDATA nodes
    if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
      ret += elem.nodeValue;

    // Traverse everything else, except comment nodes
    } else if ( elem.nodeType !== 8 ) {
      ret += Sizzle.getText( elem.childNodes );
    }
  }

  return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
  // We're going to inject a fake input element with a specified name
  var form = document.createElement("div"),
    id = "script" + (new Date()).getTime(),
    root = document.documentElement;

  form.innerHTML = "<a name='" + id + "'/>";

  // Inject it into the root element, check its status, and remove it quickly
  root.insertBefore( form, root.firstChild );

  // The workaround has to do additional checks after a getElementById
  // Which slows things down for other browsers (hence the branching)
  if ( document.getElementById( id ) ) {
    Expr.find.ID = function( match, context, isXML ) {
      if ( typeof context.getElementById !== "undefined" && !isXML ) {
        var m = context.getElementById(match[1]);

        return m ?
          m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ?
            [m] :
            undefined :
          [];
      }
    };

    Expr.filter.ID = function( elem, match ) {
      var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");

      return elem.nodeType === 1 && node && node.nodeValue === match;
    };
  }

  root.removeChild( form );

  // release memory in IE
  root = form = null;
})();

(function(){
  // Check to see if the browser returns only elements
  // when doing getElementsByTagName("*")

  // Create a fake element
  var div = document.createElement("div");
  div.appendChild( document.createComment("") );

  // Make sure no comments are found
  if ( div.getElementsByTagName("*").length > 0 ) {
    Expr.find.TAG = function( match, context ) {
      var results = context.getElementsByTagName( match[1] );

      // Filter out possible comments
      if ( match[1] === "*" ) {
        var tmp = [];

        for ( var i = 0; results[i]; i++ ) {
          if ( results[i].nodeType === 1 ) {
            tmp.push( results[i] );
          }
        }

        results = tmp;
      }

      return results;
    };
  }

  // Check to see if an attribute returns normalized href attributes
  div.innerHTML = "<a href='#'></a>";

  if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
      div.firstChild.getAttribute("href") !== "#" ) {

    Expr.attrHandle.href = function( elem ) {
      return elem.getAttribute( "href", 2 );
    };
  }

  // release memory in IE
  div = null;
})();

if ( document.querySelectorAll ) {
  (function(){
    var oldSizzle = Sizzle,
      div = document.createElement("div"),
      id = "__sizzle__";

    div.innerHTML = "<p class='TEST'></p>";

    // Safari can't handle uppercase or unicode characters when
    // in quirks mode.
    if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
      return;
    }

    Sizzle = function( query, context, extra, seed ) {
      context = context || document;

      // Only use querySelectorAll on non-XML documents
      // (ID selectors don't work in non-HTML documents)
      if ( !seed && !Sizzle.isXML(context) ) {
        // See if we find a selector to speed up
        var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );

        if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
          // Speed-up: Sizzle("TAG")
          if ( match[1] ) {
            return makeArray( context.getElementsByTagName( query ), extra );

          // Speed-up: Sizzle(".CLASS")
          } else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
            return makeArray( context.getElementsByClassName( match[2] ), extra );
          }
        }

        if ( context.nodeType === 9 ) {
          // Speed-up: Sizzle("body")
          // The body element only exists once, optimize finding it
          if ( query === "body" && context.body ) {
            return makeArray( [ context.body ], extra );

          // Speed-up: Sizzle("#ID")
          } else if ( match && match[3] ) {
            var elem = context.getElementById( match[3] );

            // Check parentNode to catch when Blackberry 4.6 returns
            // nodes that are no longer in the document #6963
            if ( elem && elem.parentNode ) {
              // Handle the case where IE and Opera return items
              // by name instead of ID
              if ( elem.id === match[3] ) {
                return makeArray( [ elem ], extra );
              }

            } else {
              return makeArray( [], extra );
            }
          }

          try {
            return makeArray( context.querySelectorAll(query), extra );
          } catch(qsaError) {}

        // qSA works strangely on Element-rooted queries
        // We can work around this by specifying an extra ID on the root
        // and working up from there (Thanks to Andrew Dupont for the technique)
        // IE 8 doesn't work on object elements
        } else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
          var oldContext = context,
            old = context.getAttribute( "id" ),
            nid = old || id,
            hasParent = context.parentNode,
            relativeHierarchySelector = /^\s*[+~]/.test( query );

          if ( !old ) {
            context.setAttribute( "id", nid );
          } else {
            nid = nid.replace( /'/g, "\\$&" );
          }
          if ( relativeHierarchySelector && hasParent ) {
            context = context.parentNode;
          }

          try {
            if ( !relativeHierarchySelector || hasParent ) {
              return makeArray( context.querySelectorAll( "[id='" + nid + "'] " + query ), extra );
            }

          } catch(pseudoError) {
          } finally {
            if ( !old ) {
              oldContext.removeAttribute( "id" );
            }
          }
        }
      }

      return oldSizzle(query, context, extra, seed);
    };

    for ( var prop in oldSizzle ) {
      Sizzle[ prop ] = oldSizzle[ prop ];
    }

    // release memory in IE
    div = null;
  })();
}

(function(){
  var html = document.documentElement,
    matches = html.matchesSelector || html.mozMatchesSelector || html.webkitMatchesSelector || html.msMatchesSelector,
    pseudoWorks = false;

  try {
    // This should fail with an exception
    // Gecko does not error, returns false instead
    matches.call( document.documentElement, "[test!='']:sizzle" );

  } catch( pseudoError ) {
    pseudoWorks = true;
  }

  if ( matches ) {
    Sizzle.matchesSelector = function( node, expr ) {
      // Make sure that attribute selectors are quoted
      expr = expr.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']");

      if ( !Sizzle.isXML( node ) ) {
        try {
          if ( pseudoWorks || !Expr.match.PSEUDO.test( expr ) && !/!=/.test( expr ) ) {
            return matches.call( node, expr );
          }
        } catch(e) {}
      }

      return Sizzle(expr, null, null, [node]).length > 0;
    };
  }
})();

(function(){
  var div = document.createElement("div");

  div.innerHTML = "<div class='test e'></div><div class='test'></div>";

  // Opera can't find a second classname (in 9.6)
  // Also, make sure that getElementsByClassName actually exists
  if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
    return;
  }

  // Safari caches class attributes, doesn't catch changes (in 3.2)
  div.lastChild.className = "e";

  if ( div.getElementsByClassName("e").length === 1 ) {
    return;
  }

  Expr.order.splice(1, 0, "CLASS");
  Expr.find.CLASS = function( match, context, isXML ) {
    if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
      return context.getElementsByClassName(match[1]);
    }
  };

  // release memory in IE
  div = null;
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];

    if ( elem ) {
      var match = false;

      elem = elem[dir];

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 && !isXML ){
          elem.sizcache = doneName;
          elem.sizset = i;
        }

        if ( elem.nodeName.toLowerCase() === cur ) {
          match = elem;
          break;
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
  for ( var i = 0, l = checkSet.length; i < l; i++ ) {
    var elem = checkSet[i];

    if ( elem ) {
      var match = false;

      elem = elem[dir];

      while ( elem ) {
        if ( elem.sizcache === doneName ) {
          match = checkSet[elem.sizset];
          break;
        }

        if ( elem.nodeType === 1 ) {
          if ( !isXML ) {
            elem.sizcache = doneName;
            elem.sizset = i;
          }

          if ( typeof cur !== "string" ) {
            if ( elem === cur ) {
              match = true;
              break;
            }

          } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
            match = elem;
            break;
          }
        }

        elem = elem[dir];
      }

      checkSet[i] = match;
    }
  }
}

if ( document.documentElement.contains ) {
  Sizzle.contains = function( a, b ) {
    return a !== b && (a.contains ? a.contains(b) : true);
  };

} else if ( document.documentElement.compareDocumentPosition ) {
  Sizzle.contains = function( a, b ) {
    return !!(a.compareDocumentPosition(b) & 16);
  };

} else {
  Sizzle.contains = function() {
    return false;
  };
}

Sizzle.isXML = function( elem ) {
  // documentElement is verified for cases where it doesn't yet exist
  // (such as loading iframes in IE - #4833)
  var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

  return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
  var match,
    tmpSet = [],
    later = "",
    root = context.nodeType ? [context] : context;

  // Position selectors must be done after the filter
  // And so must :not(positional) so we move all PSEUDOs to the end
  while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
    later += match[0];
    selector = selector.replace( Expr.match.PSEUDO, "" );
  }

  selector = Expr.relative[selector] ? selector + "*" : selector;

  for ( var i = 0, l = root.length; i < l; i++ ) {
    Sizzle( selector, root[i], tmpSet );
  }

  return Sizzle.filter( later, tmpSet );
};

/**
 * Above is the original Sizzle code.
 */

// EXPOSE qooxdoo variant

var Selector = qx.bom.Selector;

Selector.query = function(selector, context) {
  return Sizzle(selector, context);
};

Selector.matches = function(selector, set) {
  return Sizzle(selector, null, null, set);
};

})();
/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

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

/* ************************************************************************

*#require(qx.type.BaseArray)

#require(qx.bom.Document)
 *#require(qx.bom.Element)
 *#require(qx.bom.Input)
#require(qx.bom.Viewport)
#require(qx.bom.Selector)

 *#require(qx.bom.element.Attribute)
 *#require(qx.bom.element.Class)
 *#require(qx.bom.element.Location)
 *#require(qx.bom.element.Style)

************************************************************************ */

(function()
{
  /**
   * Helper method to create setters for all DOM elements in the collection
   *
   * @param clazz {Class} Static class which contains the given method
   * @param method {String} Name of the method
   * @return {Function} Returns a new function which wraps the given function
   */
  var setter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6)
    {
      var length = this.length;
      if (length > 0)
      {
        var ptn = clazz[method];
        for (var i=0; i<length; i++)
        {
          if (this[i].nodeType === 1) {
            ptn.call(clazz, this[i], arg1, arg2, arg3, arg4, arg5, arg6);
          }
        }
      }

      return this;
    };
  };


  /**
   * Helper method to create getters for the first DOM element in the collection.
   *
   * Automatically push the result to the stack if it is an element as well.
   *
   * @param clazz {Class} Static class which contains the given method
   * @param method {String} Name of the method
   * @return {Function} Returns a new function which wraps the given function
   */
  var getter = function(clazz, method)
  {
    return function(arg1, arg2, arg3, arg4, arg5, arg6)
    {
      if (this.length > 0)
      {
        var ret = this[0].nodeType === 1 ?
          clazz[method](this[0], arg1, arg2, arg3, arg4, arg5, arg6) : null;

        if (ret && ret.nodeType) {
          return this.__pushStack([ret]);
        } else {
          return ret;
        }
      }

      return null;
    };
  };


  /**
   * Wraps a set of elements and offers a whole set of features to query or modify them.
   *
   * *Chaining*
   *
   * The collection uses an interesting concept called a "Builder" to make
   * its code short and simple. The Builder pattern is an object-oriented
   * programming design pattern that has been gaining popularity.
   *
   * In a nutshell: Every method on the collection returns the collection object itself,
   * allowing you to 'chain' upon it, for example:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("a").addClass("test")
   *   .setStyle("visibility", "visible").setAttribute("html", "foo");
   * </pre>
   *
   * *Content Manipulation*
   *
   * Most methods that accept "content" will accept one or more
   * arguments of any of the following:
   *
   * * A DOM node element
   * * An array of DOM node elements
   * * A collection
   * * A string representing HTML
   *
   * Example:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#div1").append(
   *   document.createElement("br"),
   *   qx.bom.Collection.query("#div2"),
   *   "<em>after div2</em>"
   * );
   * </pre>
   *
   * Content inserting methods ({@link #append}, {@link #prepend},
   * {@link #before}, {@link #after}, and
   * {@link #replaceWith}) behave differently depending on the number of DOM
   * elements currently selected by the collection. If there is only one
   * element in the collection, the content is inserted to that element;
   * content that was in another location in the DOM tree will be moved by
   * this operation. This is essentially the same as the W3C DOM
   * <code>appendChild</code> method.
   *
   * When multiple elements are selected by a collection, these methods
   * clone the content before inserting it to each element. Since the
   * content can only exist in one location in the document tree, cloning
   * is required in these cases so that the same content can be used in
   * multiple locations.
   *
   * This rule also applies to the selector-insertion methods ({@link #appendTo},
   * {@link #prependTo}, {@link #insertBefore}, {@link #insertAfter},
   * and {@link #replaceAll}), but the auto-cloning occurs if there is more
   * than one element selected by the
   * Selector provided as an argument to the method.
   *
   * When a specific behavior is needed regardless of the number of
   * elements selected, use the {@link #clone} or {@link #remove} methods in
   * conjunction with a selector-insertion method. This example will always
   * clone <code>#Thing</code>, append it to each element with class OneOrMore, and
   * leave the original <code>#Thing</code> unmolested in the document:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#Thing").clone().appendTo(".OneOrMore");
   * </pre>
   *
   * This example will always remove <code>#Thing</code> from the document and append it
   * to <code>.OneOrMore</code>:
   *
   * <pre class="javascript">
   * qx.bom.Collection.query("#Thing").remove().appendTo(".OneOrMore");
   * </pre>
   */
  qx.Class.define("qx.bom.Collection",
  {
    extend : qx.type.BaseArray,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new Collection with the given size or the listed elements.
   *
   * <pre class="javascript">
   * var col1 = new qx.bom.Collection(length);
   * var col2 = new qx.bom.Collection(elem0, elem1, ..., elemN);
   * </pre>
   *
   * * <code>length</code>: The initial size of the collection of elements.
   * * <code>elem1, elem2. .. elemN</code>:  the elements that will compose the newly created collection
   *
   * @param length_or_items {Integer|varargs?null} The initial size of the collection
   *        OR an argument list of elements.
   */
  construct : function(length_or_items) {
    qx.type.BaseArray.apply(this,arguments);
  },



    /*
    *****************************************************************************
       STATICS
    *****************************************************************************
    */

    statics :
    {
      /**
       * Queries the selector engine and returns a new collection
       * for convenient modification and querying.
       *
       * @see qx.bom.Selector#query
       * @param selector {String} CSS Selector String
       * @param context {Element|Document?document} Context element to filter start search in
       * @return {Collection} Collection instance to wrap found elements
       */
      query : function(selector, context)
      {
        var arr = qx.bom.Selector.query(selector, context);
        return qx.lang.Array.cast(arr, qx.bom.Collection);
      },


      /**
       * Queries the DOM for an element matching the given ID. Must not contain
       * the "#" like when using the query engine.
       *
       * This is mainly a wrapper for <code>document.getElementById</code> and
       * returns a collection for easy querying and modification instead of the
       * pure DOM node.
       *
       * @param id {String} Identifier for DOM element to found
       * @return {Collection} Found element wrapped into Collection
       */
      id : function(id)
      {
        var elem = document.getElementById(id);

        // Handle the case where IE and Opera return items
        // by name instead of ID
        if (elem && elem.id != id) {
          return qx.bom.Collection.query("#" + id);
        }

        // check if the element does exist
        if (elem) {
          return new qx.bom.Collection(elem);
        } else {
          return new qx.bom.Collection();
        }
      },


      /**
       * Converts a HTML string into a collection
       *
       * @param html {String} String containing one or multiple elements or pure text content
       * @param context {Element|Document?document} Context in which newly DOM elements are created from the markup
       * @return {Collection} Collection containing the create DOM elements
       */
      html : function(html, context)
      {
        // Translate HTML into DOM elements
        var arr = qx.bom.Html.clean([html], context);

        // Translate into Collection
        return qx.lang.Array.cast(arr, qx.bom.Collection);
      },


      /** {RegExp} Test for HTML or ID */
      __expr : /^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,


      /**
       * Processes the input and translates it to a collection instance.
       *
       * @see #query
       * @see #id
       * @see #html
       * @param input {Element|String|Element[]} Supports HTML elements, HTML strings and selector strings
       * @param context {Element|Document?document} Where to start looking for the expression or
       *   any element in the document which refers to a valid document to create new elements
       *   (useful when dealing with HTML->Element translation in multi document environments).
       * @return {Collection} Newly created collection
       */
      create : function(input, context)
      {
        // Work with aliases to make it possible to call this
        // method context free e.g for "$" support.
        var Collection = qx.bom.Collection;

        // Element
        if (input.nodeType) {
          return new Collection(input);
        }

        // HTML, ID or Selector
        else if (typeof input === "string")
        {
          var match = Collection.__expr.exec(input);
          if (match) {
            return match[1] ? Collection.html(match[1], context) : Collection.id(match[3].substring(1));
          } else {
            return Collection.query(input, context);
          }
        }

        // Element Array
        else {
          return qx.lang.Array.cast(input, qx.bom.Collection);
        }
      }
    },



    /*
    *****************************************************************************
       MEMBERS
    *****************************************************************************
    */

    members :
    {
      __prevObject : null,

      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Modify the given attribute on all selected elements.
       *
       * @signature function(name, value)
       * @param name {String} Name of the attribute
       * @param value {var} New value of the attribute
       * @return {Collection} The collection is returned for chaining proposes
       */
      setAttribute : setter(qx.bom.element.Attribute, "set"),

      /**
       * Reset the given attribute on all selected elements.
       *
       * @signature function(name)
       * @param name {String} Name of the attribute
       * @return {Collection} The collection is returned for chaining proposes
       */
      resetAttribute : setter(qx.bom.element.Attribute, "reset"),

       /**
        * Figures out the value of the given attribute of
        * the first element stored in the collection.
        *
        * @signature function(name)
        * @param name {String} Name of the attribute
        * @return {var} The value of the attribute
        */
      getAttribute : getter(qx.bom.element.Attribute, "get"),



      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: CLASS
      ---------------------------------------------------------------------------
      */

      /**
       * Adds a className to the given element
       * If successfully added the given className will be returned
       *
       * @signature function(name)
       * @param name {String} The class name to add
       * @return {Collection} The collection is returned for chaining proposes
       */
      addClass : setter(qx.bom.element.Class, "add"),

      /**
       * Gets the classname of the first selected element
       *
       * @signature function()
       * @return {String} The retrieved classname
       */
      getClass : getter(qx.bom.element.Class, "get"),

      /**
       * Whether the first selected element has the given className.
       *
       * @signature function(name)
       * @param name {String} The class name to check for
       * @return {Boolean} true when the element has the given classname
       */
      hasClass : getter(qx.bom.element.Class, "has"),

      /**
       * Removes a className from the given element
       *
       * @signature function(name)
       * @param name {String} The class name to remove
       * @return {Collection} The collection is returned for chaining proposes
       */
      removeClass : setter(qx.bom.element.Class, "remove"),

      /**
       * Replaces the first given class name with the second one
       *
       * @signature function(oldName, newName)
       * @param oldName {String} The class name to remove
       * @param newName {String} The class name to add
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceClass : setter(qx.bom.element.Class, "replace"),

      /**
       * Toggles a className of the selected elements
       *
       * @signature function(name)
       * @param name {String} The class name to toggle
       * @return {Collection} The collection is returned for chaining proposes
       */
      toggleClass : setter(qx.bom.element.Class, "toggle"),




      /*
      ---------------------------------------------------------------------------
         ATTRIBUTES: VALUE
      ---------------------------------------------------------------------------
      */

      /**
       * Applies the given value to the element.
       *
       * Normally the value is given as a string/number value and applied
       * to the field content (textfield, textarea) or used to
       * detect whether the field is checked (checkbox, radiobutton).
       *
       * Supports array values for selectboxes (multiple-selection)
       * and checkboxes or radiobuttons (for convenience).
       *
       * Please note: To modify the value attribute of a checkbox or
       * radiobutton use {@link qx.bom.element.Attribute#set} instead.
       *
       * @signature function(value)
       * @param value {String|Number|Array} Value to apply to each element
       * @return {Collection} The collection is returned for chaining proposes
       */
      setValue : setter(qx.bom.Input, "setValue"),

      /**
       * Returns the currently configured value of the first
       * element in the collection.
       *
       * Works with simple input fields as well as with
       * select boxes or option elements.
       *
       * Returns an array in cases of multi-selection in
       * select boxes but in all other cases a string.
       *
       * @signature function()
       * @return {String|Array} The value of the first element.
       */
       getValue : getter(qx.bom.Input, "getValue"),






      /*
      ---------------------------------------------------------------------------
         CSS: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Modify the given style property
       * on all selected elements.
       *
       * @signature function(name, value)
       * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
       * @param value {var} The value for the given style
       * @return {Collection} The collection is returned for chaining proposes
       */
      setStyle : setter(qx.bom.element.Style, "set"),

      /**
       * Convenience method to modify a set of styles at once.
       *
       * @signature function(styles)
       * @param styles {Map} a map where the key is the name of the property
       *    and the value is the value to use.
       * @return {Collection} The collection is returned for chaining proposes
       */
      setStyles : setter(qx.bom.element.Style, "setStyles"),

      /**
       * Reset the given style property
       * on all selected elements.
       *
       * @signature function(name)
       * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
       * @return {Collection} The collection is returned for chaining proposes
       */
      resetStyle : setter(qx.bom.element.Style, "reset"),

       /**
        * Figures out the value of the given style property of
        * the first element stored in the collection.
        *
        * @signature function(name, mode)
        * @param name {String} Name of the style attribute (JS variant e.g. marginTop, wordSpacing)
        * @param mode {Number} Choose one of the modes supported by {@link qx.bom.element.Style#get}
        * @return {var} The value of the style property
        */
      getStyle : getter(qx.bom.element.Style, "get"),




      /*
      ---------------------------------------------------------------------------
         CSS: SHEET
      ---------------------------------------------------------------------------
      */

      /**
       * Set the full CSS content of the style attribute for all elements in the
       * collection.
       *
       * @signature function(value)
       * @param value {String} The full CSS string
       * @return {Collection} The collection is returned for chaining proposes
       */
      setCss : setter(qx.bom.element.Style, "setCss"),

      /**
       * Returns the full content of the style attribute of the first element
       * in the collection.
       *
       * @signature function()
       * @return {String} the full CSS string
       */
      getCss : setter(qx.bom.element.Style, "getCss"),




      /*
      ---------------------------------------------------------------------------
         CSS: POSITIONING
      ---------------------------------------------------------------------------
      */

      /**
       * Computes the location of the first element in context of
       * the document dimensions.
       *
       * Supported modes:
       *
       * * <code>margin</code>: Calculate from the margin box of the element (bigger than the visual appearance: including margins of given element)
       * * <code>box</code>: Calculates the offset box of the element (default, uses the same size as visible)
       * * <code>border</code>: Calculate the border box (useful to align to border edges of two elements).
       * * <code>scroll</code>: Calculate the scroll box (relevant for absolute positioned content).
       * * <code>padding</code>: Calculate the padding box (relevant for static/relative positioned content).
       *
       * @signature function(mode)
       * @param mode {String?box} A supported option. See comment above.
       * @return {Map} Returns a map with <code>left</code>, <code>top</code>,
       *   <code>right</code> and <code>bottom</code> which contains the distance
       *   of the element relative to the document.
       */
      getOffset : getter(qx.bom.element.Location, "get"),

      /**
       * Returns the distance between the first element of the collection to its offset parent.
       *
       * @return {Map} Returns a map with <code>left</code> and <code>top</code>
       *   which contains the distance of the elements from each other.
       */
      getPosition : getter(qx.bom.element.Location, "getPosition"),

      /**
       * Detects the offset parent of the first element
       *
       * @signature function()
       * @return {Collection} Detected offset parent encapsulated into a new collection instance
       */
      getOffsetParent : getter(qx.bom.element.Location, "getOffsetParent"),


      /**
       * Scrolls the elements of the collection to the given coordinate.
       *
       * @param value {Integer} Left scroll position
       * @return {Collection} This collection for chaining
       */
      setScrollLeft : function(value)
      {
        var Node = qx.dom.Node;

        for (var i=0, l=this.length, obj; i<l; i++)
        {
          obj = this[i];

          if (Node.isElement(obj)) {
            obj.scrollLeft = value;
          } else if (Node.isWindow(obj)) {
            obj.scrollTo(value, this.getScrollTop(obj));
          } else if (Node.isDocument(obj)) {
            Node.getWindow(obj).scrollTo(value, this.getScrollTop(obj));
          }
        }

        return this;
      },


      /**
       * Scrolls the elements of the collection to the given coordinate.
       *
       * @param value {Integer} Top scroll position
       * @return {Collection} This collection for chaining
       */
      setScrollTop : function(value)
      {
        var Node = qx.dom.Node;

        for (var i=0, l=this.length, obj; i<l; i++)
        {
          obj = this[i];

          if (Node.isElement(obj)) {
            obj.scrollTop = value;
          } else if (Node.isWindow(obj)) {
            obj.scrollTo(this.getScrollLeft(obj), value);
          } else if (Node.isDocument(obj)) {
            Node.getWindow(obj).scrollTo(this.getScrollLeft(obj), value);
          }
        }

        return this;
      },


      /**
       * Returns the left scroll position of the first element in the collection.
       *
       * @return {Integer} Current left scroll position
       */
      getScrollLeft : function()
      {
        var obj = this[0];
        if (!obj) {
          return null;
        }

        var Node = qx.dom.Node;
        if (Node.isWindow(obj) || Node.isDocument(obj)) {
          return qx.bom.Viewport.getScrollLeft();
        }

        return obj.scrollLeft;
      },


      /**
       * Returns the top scroll position of the first element in the collection.
       *
       * @return {Integer} Current top scroll position
       */
      getScrollTop : function()
      {
        var obj = this[0];
        if (!obj) {
          return null;
        }

        var Node = qx.dom.Node;
        if (Node.isWindow(obj) || Node.isDocument(obj)) {
          return qx.bom.Viewport.getScrollTop();
        }

        return obj.scrollTop;
      },




      /*
      ---------------------------------------------------------------------------
         CSS: WIDTH AND HEIGHT
      ---------------------------------------------------------------------------
      */

      /**
       * Returns the width of the first element in the collection.
       *
       * This is the rendered width of the element which includes borders and
       * paddings like the <code>offsetWidth</code> property in plain HTML.
       *
       * @return {Integer} The width of the first element
       */
      getWidth : function()
      {
        var obj = this[0];
        var Node = qx.dom.Node;

        if (obj)
        {
          if (Node.isElement(obj)) {
            return qx.bom.element.Dimension.getWidth(obj);
          } else if (Node.isDocument(obj)) {
            return qx.bom.Document.getWidth(Node.getWindow(obj));
          } else if (Node.isWindow(obj)) {
            return qx.bom.Viewport.getWidth(obj);
          }
        }

        return null;
      },


      /**
       * Returns the content width of the first element in the collection.
       *
       * The content width is basically the maximum
       * width used or the maximum width which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content width returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * Only works for DOM elements and not for the window object or the document
       * object!
       *
       * @return {Integer} Computed content width
       */
      getContentWidth : function()
      {
        var obj = this[0];
        if (qx.dom.Node.isElement(obj)) {
          return qx.bom.element.Dimension.getContentWidth(obj);
        }

        return null;
      },


      /**
       * Returns the height of the first element in the collection.
       *
       * This is the rendered height of the element which includes borders and
       * paddings like the <code>offsetHeight</code> property in plain HTML.
       *
       * @return {Integer} The height of the first element
       */
      getHeight : function()
      {
        var obj = this[0];
        var Node = qx.dom.Node;

        if (obj)
        {
          if (Node.isElement(obj)) {
            return qx.bom.element.Dimension.getHeight(obj);
          } else if (Node.isDocument(obj)) {
            return qx.bom.Document.getHeight(Node.getWindow(obj));
          } else if (Node.isWindow(obj)) {
            return qx.bom.Viewport.getHeight(obj);
          }
        }

        return null;
      },


      /**
       * Returns the content height of the first element in the collection.
       *
       * The content height is basically the maximum
       * height used or the maximum height which can be used by the content. This
       * excludes all kind of styles of the element like borders, paddings, margins,
       * and even scrollbars.
       *
       * Please note that with visible scrollbars the content height returned
       * may be larger than the box width returned via {@link #getWidth}.
       *
       * Only works for DOM elements and not for the window object or the document
       * object!
       *
       * @return {Integer} Computed content height
       */
      getContentHeight : function()
      {
        var obj = this[0];
        if (qx.dom.Node.isElement(obj)) {
          return qx.bom.element.Dimension.getContentHeight(obj);
        }

        return null;
      },





      /*
      ---------------------------------------------------------------------------
         EVENTS
      ---------------------------------------------------------------------------
      */

      /**
       * Add an event listener to the selected elements. The event listener is passed an
       * instance of {@link Event} containing all relevant information
       * about the event as parameter.
       *
       * @signature function(type, listener, self, capture)
       * @param type {String} Name of the event e.g. "click", "keydown", ...
       * @param listener {Function} Event listener function
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener. When not given, the corresponding dispatcher
       *         usually falls back to a default, which is the target
       *         by convention. Note this is not a strict requirement, i.e.
       *         custom dispatchers can follow a different strategy.
       * @param capture {Boolean} Whether to attach the event to the
       *       capturing phase or the bubbling phase of the event. The default is
       *       to attach the event handler to the bubbling phase.
       * @return {Collection} The collection is returned for chaining proposes
       */
      addListener : setter(qx.bom.Element, "addListener"),

      /**
       * Removes an event listener from the selected elements.
       *
       * Note: All registered event listeners will automatically be removed from
       *   the DOM at page unload so it is not necessary to detach events yourself.
       *
       * @signature function(type, listener, self, capture)
       * @param type {String} Name of the event
       * @param listener {Function} The pointer to the event listener
       * @param self {Object ? null} Reference to the 'this' variable inside
       *         the event listener.
       * @param capture {Boolean} Whether to remove the event listener of
       *       the bubbling or of the capturing phase.
       * @return {Collection} The collection is returned for chaining proposes
       */
      removeListener : setter(qx.bom.Element, "removeListener"),






      /*
      ---------------------------------------------------------------------------
         TRAVERSING: FILTERING
      ---------------------------------------------------------------------------
      */

      /**
       * Reduce the set of matched elements to a single element.
       *
       * The position of the element in the collection of matched
       * elements starts at 0 and goes to length - 1.
       *
       * @param index {Integer} The position of the element
       * @return {Collection} The filtered collection
       */
      eq : function(index) {
        return this.slice(index, +index + 1);
      },


      /**
       * Removes all elements from the set of matched elements that
       * do not match the specified expression(s) or be valid
       * after being tested with the given function.
       *
       * A selector function is invoked with three arguments: the value of the element, the
       * index of the element, and the Array object being traversed.
       *
       * @param selector {String|Function} An expression or function to filter
       * @param context {Object?null} Optional context for the function to being executed in.
       * @return {Collection} The filtered collection
       */
      filter : function(selector, context)
      {
        var res;

        if (qx.lang.Type.isFunction(selector)) {
          res = qx.type.BaseArray.prototype.filter.call(this, selector, context);
        } else {
          res = qx.bom.Selector.matches(selector, this);
        }

        return this.__pushStack(res);
      },


      /**
       * Checks the current selection against an expression
       * and returns true, if at least one element of the
       * selection fits the given expression.
       *
       * @param selector {String} Selector to check the content for
       * @return {Boolean} Whether at least one element matches the given selector
       */
      is : function(selector) {
        return !!selector && qx.bom.Selector.matches(selector, this).length > 0;
      },


      /** {RegExp} Test for simple selectors */
      __simple : /^.[^:#\[\.,]*$/,


      /**
       * Removes elements matching the specified expression from the collection.
       *
       * @param selector {String} CSS selector expression
       * @return {Collection} A newly created collection where the matching elements
       *    have been removed.
       */
      not : function(selector)
      {
        // Test special case where just one selector is passed in
        if (this.__simple.test(selector))
        {
          var res = qx.bom.Selector.matches(":not(" + selector + ")", this);
          return this.__pushStack(res);
        }

        // Otherwise do it in a more complicated way
        var res = qx.bom.Selector.matches(selector, this);
        return this.filter(function(value) {
          return res.indexOf(value) === -1;
        });
      },





      /*
      ---------------------------------------------------------------------------
         TRAVERSING: FINDING
      ---------------------------------------------------------------------------
      */

      /**
       * Adds more elements, matched by the given expression,
       * to the set of matched elements.
       *
       * @param selector {String} Valid selector (CSS3 + extensions)
       * @param context {Element} Context element (result elements must be children of this element)
       * @return {qx.bom.Collection} The collection is returned for chaining proposes
       */
      add : function(selector, context)
      {
        var res = qx.bom.Selector.query(selector, context);
        var arr = qx.lang.Array.unique(this.concat(res));

        return this.__pushStack(arr);
      },


      /**
       * Get a set of elements containing all of the unique immediate children
       * of each of the matched set of elements.
       *
       * This set can be filtered with an optional expression that will cause
       * only elements matching the selector to be collected.
       *
       * Also note: while <code>parents()</code> will look at all ancestors,
       * <code>children()</code> will only consider immediate child elements.
       *
       * @param selector {String?null} Optional selector to match
       * @return {Collection} The new collection
       */
      children : function(selector)
      {
        var children = [];
        for (var i=0, l=this.length; i<l; i++) {
          children.push.apply(children, qx.dom.Hierarchy.getChildElements(this[i]));
        }

        if (selector) {
          children = qx.bom.Selector.matches(selector, children);
        }

        return this.__pushStack(children);
      },


      /**
       * Get a set of elements containing the closest parent element
       * that matches the specified selector, the starting element included.
       *
       * Closest works by first looking at the current element to see if
       * it matches the specified expression, if so it just returns the
       * element itself. If it doesn't match then it will continue to
       * traverse up the document, parent by parent, until an element
       * is found that matches the specified expression. If no matching
       * element is found then none will be returned.
       *
       * @param selector {String} Expression to filter the elements with
       * @return {Collection} New collection which contains all interesting parents
       */
      closest : function(selector)
      {
        // Initialize array for reusing it as container for
        // selector match call.
        var arr = new qx.bom.Collection(1);

        // Performance tweak
        var Selector = qx.bom.Selector;

        // Map all children to given selector
        var ret = this.map(function(current)
        {
          while (current && current.ownerDocument)
          {
            arr[0] = current;

            if (Selector.matches(selector, arr).length > 0) {
              return current;
            }

            // Try the next parent
            current = current.parentNode;
          }
        });

        return this.__pushStack(qx.lang.Array.unique(ret));
      },


      /**
       * Find all the child nodes inside the matched elements (including text nodes).
       *
       * @return {Collection} A new collection containing all child nodes of the previous collection.
       */
      contents : function()
      {
        var res = [];
        var lang = qx.lang.Array;

        for (var i=0, l=this.length; i<l; i++) {
          res.push.apply(res, lang.fromCollection(this[i].childNodes));
        }

        return this.__pushStack(res);
      },


      /**
       * Searches for all elements that match the specified expression.
       * This method is a good way to find additional descendant
       * elements with which to process.
       *
       * @param selector {String} Selector for children to find
       * @return {Collection} The found elements in a new collection
       */
      find : function(selector)
      {
        var Selector = qx.bom.Selector;

        // Fast path for single item selector
        if (this.length === 1) {
          return this.__pushStack(Selector.query(selector, this[0]));
        }
        else
        {
          // Let the selector do the work and merge all result arrays.
          var ret = [];
          for (var i=0, l=this.length; i<l; i++) {
            ret.push.apply(ret, Selector.query(selector, this[i]));
          }

          return this.__pushStack(qx.lang.Array.unique(ret));
        }
      },


      /**
       * Get a set of elements containing the unique next siblings of each of the given set of elements.
       *
       * <code>next</code> only returns the very next sibling for each element, not all next siblings
       * (see {@link #nextAll}). Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all very next siblings of the current collection.
       */
      next : function(selector)
      {
        var Hierarchy = qx.dom.Hierarchy;
        var ret = this.map(Hierarchy.getNextElementSibling, Hierarchy);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Find all sibling elements after the current element.
       *
       * Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all siblings following the elements of the current collection.
       */
      nextAll : function(selector) {
        return this.__hierarchyHelper("getNextSiblings", selector);
      },


      /**
       * Get a set of elements containing the unique previous siblings of each of the given set of elements.
       *
       * <code>prev</code> only returns the very previous sibling for each element, not all previous siblings
       * (see {@link #prevAll}). Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all very previous siblings of the current collection.
       */
      prev : function(selector)
      {
        var Hierarchy = qx.dom.Hierarchy;
        var ret = this.map(Hierarchy.getPreviousElementSibling, Hierarchy);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Find all sibling elements preceding the current element.
       *
       * Use an optional expression to filter the matched set.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all siblings preceding the elements of the current collection.
       */
      prevAll : function(selector) {
        return this.__hierarchyHelper("getPreviousSiblings", selector);
      },


      /**
       * Get a set of elements containing the unique parents of the matched set of elements.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique parent elements.
       */
      parent : function(selector)
      {
        var Element = qx.dom.Element;
        var ret = qx.lang.Array.unique(this.map(Element.getParentElement, Element));

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },


      /**
       * Get a set of elements containing the unique ancestors of the matched set of
       * elements (except for the root element).
       *
       * The matched elements can be filtered with an optional expression.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique parent elements.
       */
      parents : function(selector) {
        return this.__hierarchyHelper("getAncestors", selector);
      },


      /**
       * Get a set of elements containing all of the unique siblings
       * of each of the matched set of elements.
       *
       * Can be filtered with an optional expressions.
       *
       * @param selector {String?null} Optional selector to filter the result
       * @return {Collection} Collection of all unique sibling elements.
       */
      siblings : function(selector) {
        return this.__hierarchyHelper("getSiblings", selector);
      },


      /**
       * Internal helper to work with hierarchy result arrays.
       *
       * @param method {String} Method name to execute
       * @param selector {String} Optional selector to filter the result
       * @return {Collection} Collection from all found elements
       */
      __hierarchyHelper : function(method, selector)
      {
        // Iterate ourself, as we want to directly combine the result
        var all = [];
        var Hierarchy = qx.dom.Hierarchy;
        for (var i=0, l=this.length; i<l; i++) {
          all.push.apply(all, Hierarchy[method](this[i]));
        }

        // Remove duplicates
        var ret = qx.lang.Array.unique(all);

        // Post reduce result by selector
        if (selector) {
          ret = qx.bom.Selector.matches(selector, ret);
        }

        return this.__pushStack(ret);
      },




      /*
      ---------------------------------------------------------------------------
         TRAVERSING: CHAINING
      ---------------------------------------------------------------------------
      */

      /**
       * Extend the chaining with a new collection, while
       * storing the previous collection to make it accessible
       * via <code>end()</code>.
       *
       * @param arr {Array} Array to transform into new collection
       * @return {Collection} The newly created collection
       */
      __pushStack : function(arr)
      {
        var coll = new qx.bom.Collection;

        // Remember previous collection
        coll.__prevObject = this;

        // The "apply" call only accepts real arrays, no extended ones,
        // so we need to convert it first
        arr = Array.prototype.slice.call(arr, 0);

        // Append all elements
        coll.push.apply(coll, arr);

        // Return newly formed collection
        return coll;
      },


      /**
       * Add the previous selection to the current selection.
       *
       * @return {Collection} Newly build collection containing the current and
       *    and the previous collection.
       */
      andSelf : function() {
        return this.add(this.__prevObject);
      },


      /**
       * Undone of the last modification of the collection.
       *
       * These methods change the selection during a chained method call:
       * <code>add</code>, <code>children</code>, <code>eq</code>, <code>filter</code>,
       * <code>find</code>, <code>gt</code>, <code>lt</code>, <code>next</code>,
       * <code>not</code>, <code>parent</code>, <code>parents</code> and <code>siblings</code>
       *
       * @return {Collection} The previous collection
       */
      end : function() {
        return this.__prevObject || new qx.bom.Collection();
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: CORE
      ---------------------------------------------------------------------------
      */

      /**
       * Helper method for all DOM manipulation methods which deal
       * with set of elements or HTML fragments.
       *
       * @param args {Element[]|String[]} Array of DOM elements or HTML strings
       * @param callback {Function} Method to execute for each fragment/element created
       * @return {Collection} The collection is returned for chaining proposes
       */
      __manipulate : function(args, callback)
      {
        var element = this[0];
        var doc = element.ownerDocument || element;

        // Create fragment, cleanup HTML and extract scripts
        var fragment = doc.createDocumentFragment();
        var scripts = qx.bom.Html.clean(args, doc, fragment);
        var first = fragment.firstChild;

        // Process fragment content
        if (first)
        {
          // Clone every fragment except the last one
          var last = this.length-1;
          for (var i=0, l=last; i<l; i++) {
            callback.call(this, this[i], fragment.cloneNode(true));
          }

          callback.call(this, this[last], fragment);
        }

        // Process script elements
        if (scripts)
        {
          var script;
          var Loader = qx.io.ScriptLoader;
          var Func = qx.lang.Function;

          for (var i=0, l=scripts.length; i<l; i++)
          {
            script = scripts[i];

            // Executing script code or loading source depending on element configuration
            if (script.src) {
              Loader.get().load(script.src);
            } else {
              Func.globalEval(script.text || script.textContent || script.innerHTML || "");
            }

            // Removing element from old parent
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }
        }

        return this;
      },


      /**
       * Helper for wrapping the methods to insert/replace content
       * so that they can be used in reverse order (selector is
       * given to the target method instead)
       *
       * @param args {String[]} All arguments (selectors) of the original method call
       * @param original {String} Name of the original method to wrap
       * @return {Collection} The collection is returned for chaining proposes
       */
      __manipulateTo : function(args, original)
      {
        var Selector = qx.bom.Selector;
        var Lang = qx.lang.Array;

        // Build a large collection from the individual elements
        var col = [];
        for (var i=0, l=args.length; i<l; i++)
        {
          if (qx.core.Environment.get("qx.debug"))
          {
            if (typeof args[i] !== "string") {
              throw new Error("Invalid argument for selector query: " + args[i]);
            }
          }

          col.push.apply(col, Selector.query(args[i]));
        }

        // Remove duplicates and transform into Collection
        col = Lang.cast(Lang.unique(col), qx.bom.Collection);

        // Process modification
        for (var i=0, il=this.length; i<il; i++) {
          col[original](this[i]);
        }

        return this;
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING INSIDE
      ---------------------------------------------------------------------------
      */

      /**
       * Append content to the inside of every matched element.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      append : function(varargs) {
        return this.__manipulate(arguments, this.__appendCallback);
      },


      /**
       * Prepend content to the inside of every matched element.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      prepend : function(varargs) {
        return this.__manipulate(arguments, this.__prependCallback);
      },


      /**
       * Callback for {@link #append} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __appendCallback : function(rel, child) {
        rel.appendChild(child);
      },


      /**
       * Callback for {@link #prepend} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __prependCallback : function(rel, child) {
        rel.insertBefore(child, rel.firstChild);
      },


      /**
       * Append all of the matched elements to another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).append(B)</code>, in that instead
       * of appending B to A, you're appending A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      appendTo : function(varargs) {
        return this.__manipulateTo(arguments, "append");
      },


      /**
       * Append all of the matched elements to another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).prepend(B)</code>,  in that instead
       * of prepending B to A, you're prepending A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      prependTo : function(varargs) {
        return this.__manipulateTo(arguments, "prepend");
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING OUTSIDE
      ---------------------------------------------------------------------------
      */

      /**
       * Insert content before each of the matched elements.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      before : function(varargs) {
        return this.__manipulate(arguments, this.__beforeCallback);
      },


      /**
       * Insert content after each of the matched elements.
       *
       * Supports lists of DOM elements or HTML strings through a variable
       * argument list.
       *
       * @param varargs {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      after : function(varargs) {
        return this.__manipulate(arguments, this.__afterCallback);
      },


      /**
       * Callback for {@link #before} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __beforeCallback : function(rel, child) {
        rel.parentNode.insertBefore(child, rel);
      },


      /**
       * Callback for {@link #after} to apply the insertion of content
       *
       * @param rel {Element} Relative DOM element (iteration point in selector processing)
       * @param child {Element} Child to insert
       */
      __afterCallback : function(rel, child) {
        rel.parentNode.insertBefore(child, rel.nextSibling);
      },


      /**
       * Insert all of the matched elements after another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).before(B)</code>, in that instead
       * of inserting B to A, you're inserting A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      insertBefore : function(varargs) {
        return this.__manipulateTo(arguments, "before");
      },


      /**
       * Insert all of the matched elements before another, specified, set of elements.
       *
       * This operation is, essentially, the reverse of doing a regular
       * <code>qx.bom.Collection.query(A).after(B)</code>,  in that instead
       * of inserting B to A, you're inserting A to B.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      insertAfter : function(varargs) {
        return this.__manipulateTo(arguments, "after");
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: INSERTING AROUND
      ---------------------------------------------------------------------------
      */

      /**
       * Wrap all the elements in the matched set into a single wrapper element.
       *
       * This is different from {@link #wrap} where each element in the matched set
       * would get wrapped with an element.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of
       * a document.
       *
       * This works by going through the first element provided (which is
       * generated, on the fly, from the provided HTML) and finds the deepest
       * descendant element within its structure -- it is that element, which
       * will wrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrapAll : function(content)
      {
        var first = this[0];
        if (first)
        {
          // Parse HTML / Clone given content
          var wrap = qx.bom.Collection.create(content, first.ownerDocument).clone();

          // Insert wrapper before first element
          if (first.parentNode) {
            first.parentNode.insertBefore(wrap[0], first);
          }

          // Wrap so that we have the innermost element of every item in the
          // collection. Afterwards append the current items to the wrapper.
          wrap.map(this.__getInnerHelper).append(this);
        }

        return this;
      },


      /**
       * Finds the deepest child inside the given element
       *
       * @param elem {Element} Outer DOM element
       * @return {Element} Inner DOM element
       */
      __getInnerHelper : function(elem)
      {
        while (elem.firstChild) {
          elem = elem.firstChild;
        }

        return elem;
      },


      /**
       * Wrap the inner child contents of each matched element (including
       * text nodes) with an HTML structure.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of a
       * document. This works by going through the first element provided
       * (which is generated, on the fly, from the provided HTML) and finds the
       * deepest ancestor element within its structure -- it is that element
       * that will enwrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrapInner : function(content)
      {
        // Fly weight pattern, reuse collection instance for every iteration.
        var helper = new qx.bom.Collection(1);

        for (var i=0, l=this.length; i<l; i++)
        {
          helper[0] = this[i];
          helper.contents().wrapAll(content);
        }

        return this;
      },


      /**
       * Wrap each matched element with the specified HTML content.
       *
       * This wrapping process is most useful for injecting additional structure
       * into a document, without ruining the original semantic qualities of a
       * document. This works by going through the first element provided (which
       * is generated, on the fly, from the provided HTML) and finds the deepest
       * descendant element within its structure -- it is that element, which
       * will wrap everything else.
       *
       * @param content {String|Element} Element or HTML markup used for wrapping
       * @return {Collection} The collection is returned for chaining proposes
       */
      wrap : function(content)
      {
        var helper = new qx.bom.Collection(1);

        /*
        // TODO: The current implementation of forEach() breaks in IE7

        return this.forEach(function(elem)
        {
          qx.log.Logger.debug("forEach " + elem);
          helper[0] = elem;
          helper.wrapAll(content);
        });
        */

        for (var i=0, l=this.length; i<l; i++)
        {
          helper[0] = this[i];
          helper.wrapAll(content);
        }

        return this;
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: REPLACING
      ---------------------------------------------------------------------------
      */

      /**
       * Replaces all matched elements with the specified HTML or DOM elements.
       *
       * This returns the JQuery element that was just replaced, which has been
       * removed from the DOM.
       *
       * @param content {Element|String} A reference to an DOM element or a HTML string
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceWith : function(content) {
        return this.after(content).remove();
      },


      /**
       * Replaces the elements matched by the specified selector
       * with the matched elements.
       *
       * This function is the complement to {@link #replaceWith} which does
       * the same task with the parameters reversed.
       *
       * @param varargs {String} List of selector expressions
       * @return {Collection} The collection is returned for chaining proposes
       */
      replaceAll : function(varargs) {
        return this.__manipulateTo(arguments, "replaceWith");
      },




      /*
      ---------------------------------------------------------------------------
         MANIPULATION: REMOVING
      ---------------------------------------------------------------------------
      */

      /**
       * Removes all matched elements from the DOM. This does NOT remove them
       * from the collection object, allowing you to use the matched
       * elements further. When a selector is given the list is filtered
       * by the selector and the chaining stack is pushed by the new collection.
       *
       * The Collection content can be pre-filtered with an optional selector
       * expression.
       *
       * @param selector {String?null} Selector to filter current collection
       * @return {Collection} The collection is returned for chaining proposes
       */
      remove : function(selector)
      {
        // Filter by given selector
        var coll = this;
        if (selector)
        {
          coll = this.filter(selector);
          if (coll.length == 0) {
            return this;
          }
        }

        // Remove elements from DOM
        for (var i=0, il=coll.length, current; i<il; i++)
        {
          current = coll[i];
          if (current.parentNode) {
            current.parentNode.removeChild(current);
          }
        }

        // Return filtered collection (or original if no selector given)
        return coll;
      },


      /**
       * Removes all matched elements from their parent elements,
       * cleans up any attached events or data and clears up the Collection
       * to free up memory.
       *
       * The Collection content can be pre-filtered with an optional selector
       * expression.
       *
       * Modifies the current collection (without pushing the stack) as it
       * removes all elements from the collection which where removed from the DOM.
       * This normally means all elements in the collection when no selector is given.
       *
       * @param selector {String?null} Selector to filter current collection
       * @return {Collection} The collection is returned for chaining proposes
       */
      destroy : function(selector)
      {
        if (this.length == 0) {
          return this;
        }

        var Selector = qx.bom.Selector;

        // Filter by given selector
        var coll = this;
        if (selector)
        {
          coll = this.filter(selector);
          if (coll.length == 0) {
            return this;
          }
        }

        // Collect all inner elements to prevent memory leaks
        var Manager = qx.event.Registration.getManager(this[0]);
        for (var i=0, l=coll.length, current, inner; i<l; i++)
        {
          // Cache element
          current = coll[i];

          // Remove from element in collection
          Manager.removeAllListeners(current);

          // Remove events from all children (recursive)
          inner = Selector.query("*", current);
          for (var j=0, jl=inner.length; j<jl; j++) {
            Manager.removeAllListeners(inner[j]);
          }

          // Remove collection element from DOM
          if (current.parentNode) {
            current.parentNode.removeChild(current);
          }
        }

        // Revert filter and reduce size
        if (selector)
        {
          // Exit chaining
          coll.end();

          // Remove all selected elements from current list
          qx.lang.Array.exclude(this, coll);
        }
        else
        {
          this.length = 0;
        }

        return this;
      },


      /**
       * Removes all content from the elements
       *
       * @signature function()
       * @return {Collection} The collection is returned for chaining proposes
       */
      empty : function()
      {
        var Collection = qx.bom.Collection;

        for (var i=0, l=this.length; i<l; i++)
        {
          // Remove element nodes and prevent memory leaks
          Collection.query(">*", this[i]).destroy();

          // Remove any remaining nodes
          while (this.firstChild) {
            this.removeChild(this.firstChild);
          }
        }

        return this;
      },





      /*
      ---------------------------------------------------------------------------
         MANIPULATION: CLONING
      ---------------------------------------------------------------------------
      */

      /**
       * Clone all DOM elements of the collection and return them in a newly
       * created collection.
       *
       * @param events {Boolean?false} Whether events should be copied as well
       * @return {Collection} The copied elements
       */
      clone : function(events)
      {
        var Element = qx.bom.Element;

        return events ?
          this.map(function(elem) { return Element.clone(elem, true); }) :
          this.map(Element.clone, Element);
      }
    },




    /*
    *****************************************************************************
       DEFER
    *****************************************************************************
    */

    defer : function(statics)
    {
      // Define alias as used by jQuery if not already in use.
      if (window.$ == null) {
        window.$ = statics.create;
      }
    }
  });
})();

/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Sebastian Werner, http://sebastian-werner.net

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

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
 * This class is mainly a convenience wrapper for DOM elements to
 * qooxdoo's event system.
 */
qx.Class.define("qx.bom.Html",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Helper method for XHTML replacement.
     *
     * @param all {String} Complete string
     * @param front {String} Front of the match
     * @param tag {String} Tag name
     * @return {String} XHTML corrected tag
     */
    __fixNonDirectlyClosableHelper : function(all, front, tag)
    {
      return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i) ?
        all : front + "></" + tag + ">";
    },


    /** {Map} Contains wrap fragments for specific HTML matches */
    __convertMap :
    {
      opt : [ 1, "<select multiple='multiple'>", "</select>" ], // option or optgroup
      leg : [ 1, "<fieldset>", "</fieldset>" ],
      table : [ 1, "<table>", "</table>" ],
      tr : [ 2, "<table><tbody>", "</tbody></table>" ],
      td : [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
      col : [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
      def : qx.core.Environment.select("engine.name",
      {
        "mshtml" : [ 1, "div<div>", "</div>" ],
        "default" : null
      })
    },


    /**
     * Translates a HTML string into an array of elements.
     *
     * @param html {String} HTML string
     * @param context {Document} Context document in which (helper) elements should be created
     * @return {Array} List of resulting elements
     */
    __convertHtmlString : function(html, context)
    {
      var div = context.createElement("div");

      // Fix "XHTML"-style tags in all browsers
      // Replaces tags which are not allowed to be directly closed like
      // <code>div</code> or <code>p</code>. They are patched to use an
      // open and close tag instead e.g. <p> => <p></p>
      html = html.replace(/(<(\w+)[^>]*?)\/>/g, this.__fixNonDirectlyClosableHelper);

      // Trim whitespace, otherwise indexOf won't work as expected
      var tags = html.replace(/^\s+/, "").substring(0, 5).toLowerCase();

      // Auto-wrap content into required DOM structure
      var wrap, map = this.__convertMap;
      if (!tags.indexOf("<opt")) {
        wrap = map.opt;
      } else if (!tags.indexOf("<leg")) {
        wrap = map.leg;
      } else if (tags.match(/^<(thead|tbody|tfoot|colg|cap)/)) {
        wrap = map.table;
      } else if (!tags.indexOf("<tr")) {
        wrap = map.tr;
      } else if (!tags.indexOf("<td") || !tags.indexOf("<th")) {
        wrap = map.td;
      } else if (!tags.indexOf("<col")) {
        wrap = map.col;
      } else {
        wrap = map.def;
      }

      // Omit string concat when no wrapping is needed
      if (wrap)
      {
        // Go to html and back, then peel off extra wrappers
        div.innerHTML = wrap[1] + html + wrap[2];

        // Move to the right depth
        var depth = wrap[0];
        while (depth--) {
          div = div.lastChild;
        }
      }
      else
      {
        div.innerHTML = html;
      }

      // Fix IE specific bugs
      if ((qx.core.Environment.get("engine.name") == "mshtml"))
      {
        // Remove IE's autoinserted <tbody> from table fragments
        // String was a <table>, *may* have spurious <tbody>
        var hasBody = /<tbody/i.test(html);

        // String was a bare <thead> or <tfoot>
        var tbody = !tags.indexOf("<table") && !hasBody ?
          div.firstChild && div.firstChild.childNodes :
          wrap[1] == "<table>" && !hasBody ? div.childNodes :
          [];

        for (var j=tbody.length-1; j>=0 ; --j)
        {
          if (tbody[j].tagName.toLowerCase() === "tbody" && !tbody[j].childNodes.length) {
            tbody[j].parentNode.removeChild(tbody[j]);
          }
        }

        // IE completely kills leading whitespace when innerHTML is used
        if (/^\s/.test(html)) {
          div.insertBefore(context.createTextNode(html.match(/^\s*/)[0]), div.firstChild);
        }
      }

      return qx.lang.Array.fromCollection(div.childNodes);
    },


    /**
     * Cleans-up the given HTML and append it to a fragment
     *
     * When no <code>context</code> is given the global document is used to
     * create new DOM elements.
     *
     * When a <code>fragment</code> is given the nodes are appended to this
     * fragment except the script tags. These are returned in a separate Array.
     *
     * @param objs {Element[]|String[]} Array of DOM elements or HTML strings
     * @param context {Document?document} Context in which the elements should be created
     * @param fragment {Element?null} Document fragment to appends elements to
     * @return {Element[]} Array of elements (when a fragment is given it only contains script elements)
     */
    clean: function(objs, context, fragment)
    {
      context = context || document;

      // !context.createElement fails in IE with an error but returns typeof 'object'
      if (typeof context.createElement === "undefined") {
        context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
      }

      // Fast-Path:
      // If a single string is passed in and it's a single tag
      // just do a createElement and skip the rest
      if (!fragment && objs.length === 1 && typeof objs[0] === "string")
      {
        var match = /^<(\w+)\s*\/?>$/.exec(objs[0]);
        if (match) {
          return [context.createElement(match[1])];
        }
      }

      // Interate through items in incoming array
      var obj, ret=[];
      for (var i=0, l=objs.length; i<l; i++)
      {
        obj = objs[i];

        // Convert HTML string into DOM nodes
        if (typeof obj === "string") {
          obj = this.__convertHtmlString(obj, context);
        }

        // Append or merge depending on type
        if (obj.nodeType) {
          ret.push(obj);
        } else if (obj instanceof qx.type.BaseArray) {
          ret.push.apply(ret, Array.prototype.slice.call(obj, 0));
        } else if (obj.toElement) {
          ret.push(obj.toElement());
        } else {
          ret.push.apply(ret, obj);
        }
      }

      // Append to fragment and filter out scripts... or...
      if (fragment)
      {
        var scripts=[], LArray=qx.lang.Array, elem, temp;
        for (var i=0; ret[i]; i++)
        {
          elem = ret[i];

          if (elem.nodeType == 1 && elem.tagName.toLowerCase() === "script" && (!elem.type || elem.type.toLowerCase() === "text/javascript"))
          {
            // Trying to remove the element from DOM
            if (elem.parentNode) {
              elem.parentNode.removeChild(ret[i]);
            }

            // Store in script list
            scripts.push(elem);
          }
          else
          {
            if (elem.nodeType === 1)
            {
              // Recursively search for scripts and append them to the list of elements to process
              temp = LArray.fromCollection(elem.getElementsByTagName("script"));
              ret.splice.apply(ret, [i+1, 0].concat(temp));
            }

            // Finally append element to fragment
            fragment.appendChild(elem);
          }
        }

        return scripts;
      }

      // Otherwise return the array of all elements
      return ret;
    }
  }
});
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

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * Loading of local or remote scripts.
 *
 * * Supports cross-domain communication
 * * Automatically "embeds" script so when the loaded event occurs the new features are usable as well
 */
qx.Bootstrap.define("qx.io.ScriptLoader",
{
  construct : function()
  {
    this.__oneventWrapped = qx.Bootstrap.bind(this.__onevent, this);
    this.__elem = document.createElement("script");
  },

  statics :
  {
    /**
     * {Number} Timeout limit in seconds that applies to browsers not supporting
     * the error handler. Default is 15 seconds. 0 means no timeout.
     */
    TIMEOUT: 15
  },

  members :
  {
    /** {Boolean} Whether the request is running */
    __running : null,

    /** {Boolean} Whether the current loader is disposed */
    __disposed : null,

    /** {Function} Callback method to execute */
    __callback : null,

    /** {Object} Context to execute the callback in */
    __context : null,

    /** {Function} This function is a wrapper for the DOM listener */
    __oneventWrapped : null,

    /** {Element} Stores the DOM element of the script tag */
    __elem : null,


    /**
     * Loads the script from the given URL. It is possible to define
     * a callback and a context in which the callback is executed.
     *
     * The callback is executed when the process is done with any
     * of these status messages: success, fail or abort.
     *
     * Note that browsers not supporting the native "error" event detect
     * network errors as soon as the timeout limit is reached.
     *
     * @param url {String} URL of the script
     * @param callback {Function} Callback to execute
     * @param context {Object?window} Context in which the function should be executed
     * @return {void}
     */
    load : function(url, callback, context)
    {
      if (this.__running) {
        throw new Error("Another request is still running!");
      }

      // Since load can be invoked more than one time on the same instance,
      // reset internal status
      this.__running = true;
      this.__disposed = false;

      // Place script element into head
      var head = document.getElementsByTagName("head")[0];

      // Create script element
      var script = this.__elem;

      // Store user data
      this.__callback = callback || null;
      this.__context = context || window;

      // Define mimetype
      script.type = "text/javascript";

      // Attach handlers for all browsers
      script.onerror = script.onload = script.onreadystatechange = this.__oneventWrapped;

      // BUGFIX: Browsers not supporting error handler
      //
      // Note: Because of another browser bug (fires load even though a
      // network error occured), it is virtually useless to work-around
      // for IE < 8. Therefore, only work around for Opera.
      var self = this;
      // no dependency to Environemnt to keep the minimal boot package [BUG #5068]
      if (qx.bom.client.Engine.getName() === "opera" && this._getTimeout() > 0) {
        // No need to clear timeout since on success the callback is called
        // and the loader disposed, meaning the callback is called only once
        setTimeout(function() {
          self.dispose("fail");
        }, this._getTimeout() * 1000);
      }

      // Setup URL
      script.src = url;

      // Finally append child
      // This will execute the script content
      setTimeout(function() {
        // This has to be wrapped in a timeout because under some circumstances
        // the script is evaluated synchronously. (e.g. in IE8 if the script is cached)
        head.appendChild(script);
      }, 0);
    },


    /**
     * Aborts a currently running process.
     *
     * @return {void}
     */
    abort : function()
    {
      if (this.__running) {
        this.dispose("abort");
      }
    },


    /**
     * Internal cleanup method used after every successful
     * or failed loading attempt.
     *
     * @param status {String} Any of success, fail or abort.
     * @return {void}
     */
    dispose : function(status)
    {
      if (this.__disposed) {
        return;
      }
      this.__disposed = true;

      // Get script
      var script = this.__elem;

      // Clear out listeners
      script.onerror = script.onload = script.onreadystatechange = null;

      // Remove script from head
      var scriptParent = script.parentNode;
      if (scriptParent) {
        scriptParent.removeChild(script);
      }

      // Free object
      delete this.__running;

      // Execute user callback
      if (this.__callback)
      {
        // Important to use engine detection directly to keep the minimal
        // package size small [BUG #5068]
        var engineName = qx.bom.client.Engine.getName();
        if (engineName == "mshtml" || engineName == "webkit") {
          // Safari fails with an "maximum recursion depth exceeded" error if
          // many files are loaded

          // IE may call the callback before the content is evaluated if the
          // script is served directly from the browser cache

          var self = this;
          setTimeout(qx.event.GlobalError.observeMethod(function()
          {
            self.__callback.call(self.__context, status);
            delete self.__callback;
          }), 0);
        }
        else
        {
          this.__callback.call(this.__context, status);
          delete this.__callback;
        }
      }
    },


    /**
     * Override to customize timeout limit.
     *
     * Note: Only affects browsers not supporting the error handler (Opera).
     *
     * @return {Number} Timeout limit in seconds
     */
    _getTimeout: function() {
      return qx.io.ScriptLoader.TIMEOUT;
    },


    /**
     * Internal event listener for load and error events.
     *
     * @signature function(e)
     * @param e {Event} Native event object
     */
    __onevent : qx.event.GlobalError.observeMethod(function(e) {
      // Important to use engine detection directly to keep the minimal
      // package size small [BUG #5068]
      var engineName = qx.bom.client.Engine.getName();

      // IE only
      if (engineName == "mshtml") {
        var state = this.__elem.readyState;

        if (state == "loaded") {
          this.dispose("success");
        } else if (state == "complete") {
         this.dispose("success");
        } else {
          return;
        }

      // opera only
      } else if (engineName == "opera") {
        if (qx.Bootstrap.isString(e) || e.type === "error") {
          return this.dispose("fail");
        } else if (e.type === "load") {
          return this.dispose("success");
        } else {
          return;
        }

      /// all other browsers
      } else {
        if (qx.Bootstrap.isString(e) || e.type === "error") {
          this.dispose("fail");
        } else if (e.type === "load") {
          this.dispose("success");
        } else if (e.type === "readystatechange" && (e.target.readyState === "complete" || e.target.readyState === "loaded")) {
          this.dispose("success");
        } else {
          return;
        }
      }
    })
  }
});
