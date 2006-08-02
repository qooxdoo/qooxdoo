/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

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
