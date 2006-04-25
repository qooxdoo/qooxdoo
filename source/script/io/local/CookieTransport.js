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

qx.OO.defineClass("qx.io.local.CookieTransport");

qx.io.local.CookieTransport =
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

qx.io.local.CookieTransport.set = function(vName, vValue)
{
  if (!qx.util.Validation.isValid(vValue)) {
    return qx.io.local.CookieTransport.del(vName);
  };

  var vAll = qx.io.local.CookieTransport._getAll();
  vAll[vName] = vValue;
  this._setAll(vAll);
};

qx.io.local.CookieTransport.get = function(vName)
{
  var vAll = qx.io.local.CookieTransport._getAll();

  var vValue = qx.io.local.CookieTransport._getAll()[vName];
  if (qx.util.Validation.isValidString(vValue)) {
    return vValue;
  };

  return qx.Const.CORE_EMPTY;
};

qx.io.local.CookieTransport.del = function(vName)
{
  var vAll = qx.io.local.CookieTransport._getAll();
  delete vAll[vName];
  this._setAll(vAll);
};

qx.io.local.CookieTransport.setAll = function(vHash)
{
  var vAll = qx.io.local.CookieTransport._getAll();
  vAll = QxUtil.mergeWithObject(vAll, vHash);
  qx.io.local.CookieTransport._setAll(vAll);
};

qx.io.local.CookieTransport.getAll = function() {
  return qx.io.local.CookieTransport._getAll();
};

qx.io.local.CookieTransport.replaceAll = function(vHash) {
  qx.io.local.CookieTransport._setAll(vHash);
};

qx.io.local.CookieTransport.delAll = function() {
  qx.io.local.CookieTransport.replaceAll({});
};





/*
---------------------------------------------------------------------------
  LOW LEVEL INTERNAL METHODS
---------------------------------------------------------------------------
*/

qx.io.local.CookieTransport._getAll = function()
{
  var vHash = {};
  var vCookie, vItems, vItem;

  for (var i=0; i<qx.io.local.CookieTransport.MAXCOOKIES; i++)
  {
    vCookie = qx.io.local.CookieApi.get(qx.io.local.CookieTransport.BASENAME + i);
    if (vCookie)
    {
      vItems = vCookie.split(qx.io.local.CookieTransport.ITEMSEPARATOR);
      for (var j=0, l=vItems.length; j<l; j++)
      {
        vItem = vItems[j].split(qx.io.local.CookieTransport.KEYVALUESEPARATOR);
        vHash[vItem[0]] = vItem[1];
      };
    };
  };

  return vHash;
};

qx.io.local.CookieTransport._setAll = function(vHash)
{
  var vString = qx.Const.CORE_EMPTY;
  var vTemp;
  var vIndex = 0;

  for (var vName in vHash)
  {
    vTemp = vName + qx.io.local.CookieTransport.KEYVALUESEPARATOR + vHash[vName];

    if (vTemp.length > qx.io.local.CookieTransport.MAXSIZE)
    {
      qx.dev.Debug("qx.io.local.CookieTransport", "Could not store value of name '" + vName + "': Maximum size of " + qx.io.local.CookieTransport.MAXSIZE + "reached!");
      continue;
    };

    if ((qx.io.local.CookieTransport.ITEMSEPARATOR.length + vString.length + vTemp.length) > qx.io.local.CookieTransport.MAXSIZE)
    {
      qx.io.local.CookieTransport._setCookie(vIndex++, vString);

      if (vIndex == qx.io.local.CookieTransport.MAXCOOKIES)
      {
        qx.dev.Debug("qx.io.local.CookieTransport", "Failed to store cookie. Max cookie amount reached!", "error");
        return false;
      };

      vString = vTemp;
    }
    else
    {
      if (vString != qx.Const.CORE_EMPTY) {
        vString += qx.io.local.CookieTransport.ITEMSEPARATOR;
      };

      vString += vTemp;
    };
  };

  if (vString != qx.Const.CORE_EMPTY) {
    qx.io.local.CookieTransport._setCookie(vIndex++, vString);
  };

  while (vIndex < qx.io.local.CookieTransport.MAXCOOKIES) {
    qx.io.local.CookieTransport._delCookie(vIndex++);
  };
};

qx.io.local.CookieTransport._setCookie = function(vIndex, vString)
{
  // qx.dev.Debug("qx.io.local.CookieTransport", "Store: " + vIndex + " = " + vString);
  qx.io.local.CookieApi.set(qx.io.local.CookieTransport.BASENAME + vIndex, vString);
};

qx.io.local.CookieTransport._delCookie = function(vIndex)
{
  // qx.dev.Debug("qx.io.local.CookieTransport", "Delete: " + vIndex);
  qx.io.local.CookieApi.del(qx.io.local.CookieTransport.BASENAME + vIndex);
};
