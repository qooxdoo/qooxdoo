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

qx.OO.defineClass("qx.lang.Array");

qx.lang.Array.fromArguments = function(args) {
  return Array.prototype.slice.call(args, 0);
}

/*!
  Utility function for padding/margin and all other shorthand handling.
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

qx.lang.Array.copy = function(arr) {
  return arr.concat();
}

qx.lang.Array.clone = function(arr) {
  return arr.concat();
}

qx.lang.Array.getLast = function(arr) {
  return arr[arr.length-1];
}

qx.lang.Array.getFirst = function(arr) {
  return arr[0];
}

qx.lang.Array.insertAt = function(arr, obj, i)
{
  arr.splice(i, 0, obj);

  return arr;
}

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

qx.lang.Array.insertAfter = function(arr, o, o2)
{
  var i = arr.indexOf(o2);

  if (i == -1 || i == (arr.length-1))
  {
    arr.push(o);
  }
  else
  {
    arr.splice(i+1, 0, o);
  }

  return arr;
}

qx.lang.Array.removeAt = function(arr, i) {
  return arr.splice(i, 1);
}

qx.lang.Array.removeAll = function(arr) {
  return arr.splice(0, arr.length);
}

qx.lang.Array.append = function(arr, a) {
  Array.prototype.push.apply(arr, a);
}

qx.lang.Array.remove = function(arr, obj)
{
  var i = arr.indexOf(obj);

  if (i != -1) {
    return arr.splice(i, 1);
  }
}

qx.lang.Array.contains = function(arr, obj) {
  return arr.indexOf(obj) != -1;
}
