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

qx.OO.defineClass("qx.renderer.color.ColorCache");

qx.renderer.color.ColorCache = function(propValue, propData)
{
  var propKey;
  var propKeyAsStyle = false;

  switch(typeof propValue)
  {
    case qx.Const.TYPEOF_STRING:
      if (propValue != qx.Const.CORE_EMPTY) {
        propValue = propKey = propValue.toLowerCase();
        break;
      };

      return propValue;

    case qx.Const.TYPEOF_NUMBER:
      if (propValue >= 0 && propValue <= 255)
      {
        propKey = propValue.toString();
        break;
      };

      return propValue;

    case qx.Const.TYPEOF_OBJECT:
      if (propValue == null || propValue instanceof qx.renderer.color.Color) {
        return propValue;
      };

      // Try to detect array of RGB values
      if (typeof propValue.join === qx.Const.TYPEOF_FUNCTION && propValue.length == 3)
      {
        propKey = qx.renderer.color.Color.RGBCSS_START + propValue.join(qx.Const.CORE_COMMA) + qx.renderer.color.Color.RGBCSS_STOP;
        propKeyAsStyle = true;
        break;
      };

    default:
      return propValue;
  };

  if (qx.renderer.color.ColorCache._data[propKey]) {
    return qx.renderer.color.ColorCache._data[propKey];
  };

  // this.debug("Create new color instance: " + propKey);

  var vColorObject = qx.renderer.color.ColorCache._data[propKey] = qx.renderer.color.Color.themedNames[propValue] ? new qx.renderer.color.ColorObject(propValue) : new qx.renderer.color.Color(propValue);

  if (propKeyAsStyle) {
    vColorObject._style = propKey;
  };

  return vColorObject;
};

qx.renderer.color.ColorCache._data = {};
