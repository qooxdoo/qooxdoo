/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(core)

************************************************************************ */

qx.OO.defineClass("qx.lang.Number");

qx.lang.Number.isInRange = function(nr, vmin, vmax) {
  return nr >= vmin && nr <= vmax;
};

qx.lang.Number.isBetweenRange = function(nr, vmin, vmax) {
  return nr > vmin && nr < vmax;
};

qx.lang.Number.limit = function(nr, vmin, vmax)
{
  if (typeof vmax === qx.Const.TYPEOF_NUMBER && nr > vmax)
  {
    return vmax;
  }
  else if (typeof vmin === qx.Const.TYPEOF_NUMBER && nr < vmin)
  {
    return vmin;
  }
  else
  {
    return nr;
  };
};
