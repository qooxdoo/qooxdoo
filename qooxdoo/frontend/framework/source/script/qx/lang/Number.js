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

qx.OO.defineClass("qx.lang.Number");

qx.lang.Number.isInRange = function(nr, vmin, vmax) {
  return nr >= vmin && nr <= vmax;
}

qx.lang.Number.isBetweenRange = function(nr, vmin, vmax) {
  return nr > vmin && nr < vmax;
}

qx.lang.Number.limit = function(nr, vmin, vmax)
{
  if (typeof vmax === qx.constant.Type.NUMBER && nr > vmax)
  {
    return vmax;
  }
  else if (typeof vmin === qx.constant.Type.NUMBER && nr < vmin)
  {
    return vmin;
  }
  else
  {
    return nr;
  }
}
