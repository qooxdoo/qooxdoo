/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.lang.Function");





/*
---------------------------------------------------------------------------
  SIMPLE RETURN METHODS
---------------------------------------------------------------------------
*/

qx.lang.Function.returnTrue = function() {
  return true;
};

qx.lang.Function.returnFalse = function() {
  return false;
};

qx.lang.Function.returnNull = function() {
  return null;
};

qx.lang.Function.returnThis = function() {
  return this;
};

qx.lang.Function.returnInstance = function()
{
  if (!this._instance)
  {
    this._instance = new this;

    /*
    if (this._instance.debug) {
      this._instance.debug("Created...");
    }*/
  }

  return this._instance;
};

qx.lang.Function.returnZero = function() {
  return 0;
};

qx.lang.Function.returnNegativeIndex = function() {
  return -1;
};
