/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by Schlund + Partner AG, Germany
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sw at schlund dot de>
     * Andreas Ecker (ecker)
       <ae at schlund dot de>

************************************************************************ */

/* ************************************************************************

#package(border)

************************************************************************ */

qx.OO.defineClass("qx.renderer.border.BorderCache");

qx.renderer.border.BorderCache = function(propValue, propData)
{
  if (qx.util.Validation.isValidArray(propValue) && propValue.length > 1)
  {
    propString = qx.constant.Core.EMPTY;

    for (var i=0, l=propValue.length, p; i<l; i++)
    {
      p = propValue[i];

      propString += p;

      if (typeof p === qx.constant.Type.NUMBER) {
        propString += qx.constant.Core.PIXEL;
      };

      if (i<(l-1)) {
        propString += qx.constant.Core.SPACE;
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
