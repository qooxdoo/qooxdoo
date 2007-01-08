/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Helper functions for JavaScript arrays
 */
qx.OO.defineClass("qx.lang.Array");

/**
 * Convert an arguments object into an array
 *
 * @param args {arguments} arguments object
 * @return {array}
 */
qx.lang.Array.fromArguments = function(args) {
  return Array.prototype.slice.call(args, 0);
}

/**
 * Expand shorthand definition to a four element list.
 * This is an utility function for padding/margin and all other shorthand handling.
 *
 * @param input {Array} array with one to four elements
 * @return {Array} array with four elements
 */
qx.lang.Array.fromShortHand = function(input)
{
  var len = input.length;

  if (len > 4 || len == 0) {
    this.error("Invalid number of arguments!");
  }

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
}

/**
 * Return a copy of the given array
 *
 * @param arr {Array}
 * @return {Array} copy of the array
 */
qx.lang.Array.copy = function(arr) {
  return arr.concat();
}

/**
 * Return a copy of the given array
 * The same as @see(qx.lang.Array.copy)
 *
 * @param arr {Array}
 * @return {Array} copy of the array
 */
qx.lang.Array.clone = function(arr) {
  return arr.concat();
}

/**
 * Return the last element of an array
 *
 * @param arr {Array}
 * @return {var} the last element of the array
 */
qx.lang.Array.getLast = function(arr) {
  return arr[arr.length-1];
}

/**
 * Return the first element of an array
 *
 * @param arr {Array}
 * @return {var} the first element of the array
 */
qx.lang.Array.getFirst = function(arr) {
  return arr[0];
}

/**
 * Insert an element at a given position into the array
 *
 * @param arr {Array}
 * @param obj {var} the element to insert
 * @param i {int} position where to insert the element into the array
 * @return {Array} the array
 */
qx.lang.Array.insertAt = function(arr, obj, i)
{
  arr.splice(i, 0, obj);

  return arr;
}

/**
 * Insert an element into the array before a given second element
 *
 * @param arr {Array}
 * @param obj {var} object to be inserted
 * @param obj2 {var} insert obj1 before this object
 * @return {Array} the array
 */
qx.lang.Array.insertBefore = function(arr, obj, obj2)
{
  var i = arr.indexOf(obj2);

  if (i == -1)
  {
    arr.push(obj);
  }
  else
  {
    arr.splice(i, 0, obj);
  }

  return arr;
}

/**
 * Insert an element into the array after a given second element
 *
 * @param arr {Array}
 * @param obj {var} object to be inserted
 * @param obj2 {var} insert obj1 after this object
 * @return {Array} the array
 */
qx.lang.Array.insertAfter = function(arr, obj, obj2)
{
  var i = arr.indexOf(obj2);

  if (i == -1 || i == (arr.length-1))
  {
    arr.push(obj);
  }
  else
  {
    arr.splice(i+1, 0, obj);
  }

  return arr;
}

/**
 * Remove an element from the array at the given index
 *
 * @param arr {Array}
 * @param i {int} index of the element to be removed
 * @return {Array} the array with the element remnoved
 */
qx.lang.Array.removeAt = function(arr, i) {
  return arr.splice(i, 1);
}

/**
 * Remmove all elements from the array
 *
 * @param arr {Array}
 * @return {Array} empty array
 */
qx.lang.Array.removeAll = function(arr) {
  return arr.splice(0, arr.length);
}

/**
 * Append the elements of an array to the array
 *
 * @param arr {Array}
 * @param a {Array} the elements of this array will be appended to the array
 */
qx.lang.Array.append = function(arr, a) {
  Array.prototype.push.apply(arr, a);
}

/**
 * Remove an element from the array
 *
 * @param arr {Array}
 * @param obj {var} element to be removed from the array
 * @return {Array} array with the element removed
 */
qx.lang.Array.remove = function(arr, obj)
{
  var i = arr.indexOf(obj);

  if (i != -1) {
    return arr.splice(i, 1);
  }
}

/**
 * Whether the array contains the given element
 *
 * @param arr {Array}
 * @param obj {var} object to look for
 * @return {boolean} whether the array contains the element
 */
qx.lang.Array.contains = function(arr, obj) {
  return arr.indexOf(obj) != -1;
}