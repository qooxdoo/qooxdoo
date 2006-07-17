/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.util.Return");





/*
---------------------------------------------------------------------------
  SIMPLE RETURN METHODS
---------------------------------------------------------------------------
*/

qx.util.Return.returnTrue = function() {
  return true;
}

qx.util.Return.returnFalse = function() {
  return false;
}

qx.util.Return.returnNull = function() {
  return null;
}

qx.util.Return.returnThis = function() {
  return this;
}

qx.util.Return.returnZero = function() {
  return 0;
}

qx.util.Return.returnNegativeIndex = function() {
  return -1;
}
