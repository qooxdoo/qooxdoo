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

function QxBorderCache(propValue, propData)
{
  if (QxUtil.isValidArray(propValue) && propValue.length > 1)
  {
    propString = QxConst.CORE_EMPTY;

    for (var i=0, l=propValue.length, p; i<l; i++)
    {
      p = propValue[i];

      propString += p;

      if (typeof p === QxConst.TYPEOF_NUMBER) {
        propString += QxConst.CORE_PIXEL;
      };

      if (i<(l-1)) {
        propString += QxConst.CORE_SPACE;
      };
    };

    propValue = propString;
  }
  else if (QxUtil.isInvalidString(propValue))
  {
    return propValue;
  };

  if (QxBorderCache._data[propValue]) {
    return QxBorderCache._data[propValue];
  };

  return QxBorderCache._data[propValue] = QxBorderObject.fromString(propValue);
};

QxBorderCache._data = {};
