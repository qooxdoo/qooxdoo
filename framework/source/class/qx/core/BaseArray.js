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

/**
 * The BaseArray class is the common superclass for all array classes in
 * qooxdoo.
 */
qx.Class.define("qx.core.BaseArray",
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
   * var arr1 = new qx.core.BaseArray(arrayLength);
   * var arr2 = new qx.core.BaseArray(element0, element1, ..., elementN);
   * </pre>
   *
   * * <code>arrayLength</code>: The initial length of the array. You can access 
   * this value using the length property. If the value specified is not a 
   * number, an array of length 1 is created, with the first element having 
   * the specified value. The maximum length allowed for an 
   * array is 4,294,967,295. 
   * * <code>elementN</code>:  A value for the element in that position in the 
   * array. When this formis used, the array is initialized with the specified 
   * values as its elements, and the array's length property is set to the 
   * number of arguments. 
   *
   * @param length {Integer} The length of the array
   */
  construct : function(length) {},


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
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
     * @return {Array} New array with the removed elements.
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
     * This method do not modify the array and return a modified copy of the original.
     *
     * @signature function(varargs)
     * @param varargs {Array|var} Arrays and/or values to concatenate to the resulting array. 
     * @return {Array} New array built of the given arrays or values.
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
     * @return {Array} An new array which contains a copy of the given region.
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
    lastIndexOf : null                   
  }
});

qx.core.BaseArray = function(Stack)
{
  // Redefine Stack's prototype (IE fix for length)
  if((new Stack(0,1)).length === 0)
  {
    Stack.prototype = { length : 0 };
    
    var args = "pop.push.reverse.shift.sort.splice.unshift.join.slice".split(".");
    
    for (var length = args.length; length;) {
      Stack.prototype[args[--length]] = Array.prototype[args[length]];
    }      
  };
  
  // Remember Array's slice method
  var slice = Array.prototype.slice;
    
  // Fix "slice" method
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
    
  // Fix constructor
  Stack.prototype.constructor = Stack;

  // These are improved later upon, so we store the originals first
  var filter = Array.prototype.filter;
  var map = Array.prototype.map;  
  
  // Add JS 1.6 Array features
  if (!Array.prototype.indexOf)
  {
    Stack.prototype.indexOf = function(searchElement, fromIndex)
    {
      if (fromIndex == null) {
        fromIndex = 0;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
      }
  
      for (var i=fromIndex; i<this.length; i++)
      {
        if (this[i] === searchElement) {
          return i;
        }
      }
  
      return -1;
    };
  }
  
  if (!Array.prototype.lastIndexOf)
  {
    Stack.prototype.lastIndexOf = function(searchElement, fromIndex)
    {
      if (fromIndex == null) {
        fromIndex = this.length - 1;
      } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
      }
  
      for (var i=fromIndex; i>=0; i--)
      {
        if (this[i] === searchElement) {
          return i;
        }
      }
  
      return -1;
    };
  }
  
  if (!Array.prototype.forEach)
  {
    Stack.prototype.forEach = function(callback, obj)
    {
      // The array length should be fixed, like in the native implementation.
      var l = this.length;
  
      for (var i=0; i<l; i++) {
        callback.call(obj, this[i], i, this);
      }
    };
  }
  
  if (!filter)
  {
    // This is applied to the prototype later for fix the native return value
    filter = function(callback, obj)
    {
      // The array length should be fixed, like in the native implementation.
      var l = this.length;
      var res = [];
  
      for (var i=0; i<l; i++)
      {
        if (callback.call(obj, this[i], i, this)) {
          res.push(this[i]);
        }
      }
  
      return res;
    };
  }
  
  if (!map)
  {
    // This is applied to the prototype later for fix the native return value
    map = function(callback, obj)
    {
      // The array length should be fixed, like in the native implementation.
      var l = this.length;
      var res = [];
  
      for (var i=0; i<l; i++) {
        res.push(callback.call(obj, this[i], i, this));
      }
  
      return res;
    };
  }
  
  if (!Array.prototype.some)
  {
    Stack.prototype.some = function(callback, obj)
    {
      // The array length should be fixed, like in the native implementation.
      var l = this.length;
  
      for (var i=0; i<l; i++)
      {
        if (callback.call(obj, this[i], i, this)) {
          return true;
        }
      }
  
      return false;
    };
  }
  
  if (!Array.prototype.every)
  {
    Stack.prototype.every = function(callback, obj)
    {
      // The array length should be fixed, like in the native implementation.
      var l = this.length;
  
      for (var i=0; i<l; i++)
      {
        if (!callback.call(obj, this[i], i, this)) {
          return false;
        }
      }
  
      return true;
    };
  }    
  
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

  // Add new "to" method for easy translation between Array-like instances
  Stack.prototype.to = function(constructor)
  {
    if (this.constructor === constructor) {
      return this; 
    }
    
    var ret = new constructor;
    ret.push.apply(ret, Array.prototype.slice.call(this, 0));
    return ret;
  };  
  
  // Add valueOf() to return the length
  Stack.prototype.valueOf = function(){
    return this.length;
  };  

  // Return final class
  return Stack;
}
(function()
{
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
  
  return Stack;
}());
