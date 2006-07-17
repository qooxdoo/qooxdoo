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

#module(border)

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
      }

      if (i<(l-1)) {
        propString += qx.constant.Core.SPACE;
      }
    }

    propValue = propString;
  }
  else if (qx.util.Validation.isInvalidString(propValue))
  {
    return propValue;
  }

  if (qx.renderer.border.BorderCache._data[propValue]) {
    return qx.renderer.border.BorderCache._data[propValue];
  }

  return qx.renderer.border.BorderCache._data[propValue] = qx.renderer.border.BorderObject.fromString(propValue);
}

qx.renderer.border.BorderCache._data = {}
