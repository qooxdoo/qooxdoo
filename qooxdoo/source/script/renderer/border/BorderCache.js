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

#package(border)

************************************************************************ */

qx.renderer.border.BorderCache = function(propValue, propData)
{
  if (qx.util.Validation.isValidArray(propValue) && propValue.length > 1)
  {
    propString = qx.Const.CORE_EMPTY;

    for (var i=0, l=propValue.length, p; i<l; i++)
    {
      p = propValue[i];

      propString += p;

      if (typeof p === qx.Const.TYPEOF_NUMBER) {
        propString += qx.Const.CORE_PIXEL;
      };

      if (i<(l-1)) {
        propString += qx.Const.CORE_SPACE;
      };
    };

    propValue = propString;
  }
  else if (qx.util.Validation.isInvalidString(propValue))
  {
    return propValue;
  };

  if (qx.renderer.border.BorderCache._data[propValue]) {
    return qx.renderer.border.BorderCache._data[propValue];
  };

  return qx.renderer.border.BorderCache._data[propValue] = qx.renderer.border.BorderObject.fromString(propValue);
};

qx.renderer.border.BorderCache._data = {};
