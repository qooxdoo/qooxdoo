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

#package(storage)

************************************************************************ */

qx.io.local.CookieStorage =
{
  BASENAME : "Qx",
  ITEMSEPARATOR : "&",
  KEYVALUESEPARATOR : "=",
  MAXCOOKIES : 20,
  MAXSIZE : 4096
};





/*
---------------------------------------------------------------------------
  USER APPLICATION METHODS
---------------------------------------------------------------------------
*/

qx.io.local.CookieStorage.set = function(vName, vValue)
{
  if (!qx.util.Validation.isValid(vValue)) {
    return qx.io.local.CookieStorage.del(vName);
  };

  var vAll = qx.io.local.CookieStorage._getAll();
  vAll[vName] = vValue;
  this._setAll(vAll);
};

qx.io.local.CookieStorage.get = function(vName)
{
  var vAll = qx.io.local.CookieStorage._getAll();

  var vValue = qx.io.local.CookieStorage._getAll()[vName];
  if (qx.util.Validation.isValidString(vValue)) {
    return vValue;
  };

  return QxConst.CORE_EMPTY;
};

qx.io.local.CookieStorage.del = function(vName)
{
  var vAll = qx.io.local.CookieStorage._getAll();
  delete vAll[vName];
  this._setAll(vAll);
};

qx.io.local.CookieStorage.setAll = function(vHash)
{
  var vAll = qx.io.local.CookieStorage._getAll();
  vAll = QxUtil.mergeWithObject(vAll, vHash);
  qx.io.local.CookieStorage._setAll(vAll);
};

qx.io.local.CookieStorage.getAll = function() {
  return qx.io.local.CookieStorage._getAll();
};

qx.io.local.CookieStorage.replaceAll = function(vHash) {
  qx.io.local.CookieStorage._setAll(vHash);
};

qx.io.local.CookieStorage.delAll = function() {
  qx.io.local.CookieStorage.replaceAll({});
};





/*
---------------------------------------------------------------------------
  LOW LEVEL INTERNAL METHODS
---------------------------------------------------------------------------
*/

qx.io.local.CookieStorage._getAll = function()
{
  var vHash = {};
  var vCookie, vItems, vItem;

  for (var i=0; i<qx.io.local.CookieStorage.MAXCOOKIES; i++)
  {
    vCookie = qx.io.local.Cookie.get(qx.io.local.CookieStorage.BASENAME + i);
    if (vCookie)
    {
      vItems = vCookie.split(qx.io.local.CookieStorage.ITEMSEPARATOR);
      for (var j=0, l=vItems.length; j<l; j++)
      {
        vItem = vItems[j].split(qx.io.local.CookieStorage.KEYVALUESEPARATOR);
        vHash[vItem[0]] = vItem[1];
      };
    };
  };

  return vHash;
};

qx.io.local.CookieStorage._setAll = function(vHash)
{
  var vString = QxConst.CORE_EMPTY;
  var vTemp;
  var vIndex = 0;

  for (var vName in vHash)
  {
    vTemp = vName + qx.io.local.CookieStorage.KEYVALUESEPARATOR + vHash[vName];

    if (vTemp.length > qx.io.local.CookieStorage.MAXSIZE)
    {
      qx.dev.Debug("qx.io.local.CookieStorage", "Could not store value of name '" + vName + "': Maximum size of " + qx.io.local.CookieStorage.MAXSIZE + "reached!");
      continue;
    };

    if ((qx.io.local.CookieStorage.ITEMSEPARATOR.length + vString.length + vTemp.length) > qx.io.local.CookieStorage.MAXSIZE)
    {
      qx.io.local.CookieStorage._setCookie(vIndex++, vString);

      if (vIndex == qx.io.local.CookieStorage.MAXCOOKIES)
      {
        qx.dev.Debug("qx.io.local.CookieStorage", "Failed to store cookie. Max cookie amount reached!", "error");
        return false;
      };

      vString = vTemp;
    }
    else
    {
      if (vString != QxConst.CORE_EMPTY) {
        vString += qx.io.local.CookieStorage.ITEMSEPARATOR;
      };

      vString += vTemp;
    };
  };

  if (vString != QxConst.CORE_EMPTY) {
    qx.io.local.CookieStorage._setCookie(vIndex++, vString);
  };

  while (vIndex < qx.io.local.CookieStorage.MAXCOOKIES) {
    qx.io.local.CookieStorage._delCookie(vIndex++);
  };
};

qx.io.local.CookieStorage._setCookie = function(vIndex, vString)
{
  // qx.dev.Debug("qx.io.local.CookieStorage", "Store: " + vIndex + " = " + vString);
  qx.io.local.Cookie.set(qx.io.local.CookieStorage.BASENAME + vIndex, vString);
};

qx.io.local.CookieStorage._delCookie = function(vIndex)
{
  // qx.dev.Debug("qx.io.local.CookieStorage", "Delete: " + vIndex);
  qx.io.local.Cookie.del(qx.io.local.CookieStorage.BASENAME + vIndex);
};
