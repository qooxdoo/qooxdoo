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

#package(color)

************************************************************************ */

function QxColorCache(propValue, propData)
{
  var propKey;
  var propKeyAsStyle = false;

  switch(typeof propValue)
  {
    case QxConst.TYPEOF_STRING:
      if (propValue != QxConst.CORE_EMPTY) {
        propValue = propKey = propValue.toLowerCase();
        break;
      };

      return propValue;

    case QxConst.TYPEOF_NUMBER:
      if (propValue >= 0 && propValue <= 255)
      {
        propKey = propValue.toString();
        break;
      };

      return propValue;

    case QxConst.TYPEOF_OBJECT:
      if (propValue == null || propValue instanceof QxColor) {
        return propValue;
      };

      // Try to detect array of RGB values
      if (typeof propValue.join === QxConst.TYPEOF_FUNCTION && propValue.length == 3)
      {
        propKey = QxColor.RGBCSS_START + propValue.join(QxConst.CORE_COMMA) + QxColor.RGBCSS_STOP;
        propKeyAsStyle = true;
        break;
      };

    default:
      return propValue;
  };

  if (QxColorCache._data[propKey]) {
    return QxColorCache._data[propKey];
  };

  // this.debug("Create new color instance: " + propKey);

  var vColorObject = QxColorCache._data[propKey] = QxColor.themedNames[propValue] ? new QxColorObject(propValue) : new QxColor(propValue);

  if (propKeyAsStyle) {
    vColorObject._style = propKey;
  };

  return vColorObject;
};

QxColorCache._data = {};
