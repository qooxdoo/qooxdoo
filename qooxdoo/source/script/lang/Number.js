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

qx.lang.Number = {};

qx.lang.Number.isInRange = function(nr, vmin, vmax) {
  return nr >= vmin && nr <= vmax;
};

qx.lang.Number.isBetweenRange = function(nr, vmin, vmax) {
  return nr > vmin && nr < vmax;
};




Number.prototype.limit = function(vmin, vmax)
{
  if (vmax != null && typeof vmax === QxConst.TYPEOF_NUMBER && this > vmax)
  {
    return vmax;
  }
  else if (vmin != null && typeof vmin === QxConst.TYPEOF_NUMBER && this < vmin)
  {
    return vmin;
  }
  else
  {
    // Number is needed, otherwise a object will be returned
    return Number(this);
  };
};
