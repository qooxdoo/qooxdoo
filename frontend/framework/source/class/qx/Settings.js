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

#id(qx.Settings)
#module(core)

************************************************************************ */

// If you change this, change these in build.py, too.
if (typeof qx === "undefined") {
  var qx = { _UNDEFINED : "undefined", _LOADSTART : (new Date).valueOf() };
}

if (typeof qx.Settings === qx._UNDEFINED) {
  qx.Settings = { _userSettings:{}, _defaultSettings:{} };
}






qx.Settings.getValue = function(vKey) {
  return qx.Settings.getValueOfClass(qx.Class.classname, vKey);
}

qx.Settings.getValueOfClass = function(vClassName, vKey)
{
  var vUserObject = qx.Settings._userSettings[vClassName];
  if (vUserObject && typeof vUserObject[vKey] !== qx._UNDEFINED) {
    return vUserObject[vKey];
  }

  var vDefaultObject = qx.Settings._defaultSettings[vClassName];
  if (vDefaultObject && typeof vDefaultObject[vKey] !== qx._UNDEFINED) {
    return vDefaultObject[vKey];
  }

  return null;
}

qx.Settings.setDefault = function(vKey, vValue) {
  return qx.Settings.setDefaultOfClass(qx.Class.classname, vKey, vValue);
}

qx.Settings.setDefaultOfClass = function(vClassName, vKey, vValue)
{
  var vDefaultObject = qx.Settings._defaultSettings[vClassName];

  if (!vDefaultObject) {
    vDefaultObject = qx.Settings._defaultSettings[vClassName] = {};
  }

  vDefaultObject[vKey] = vValue;
}
