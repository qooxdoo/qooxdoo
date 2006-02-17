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

var QxCookieStorage =
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

QxCookieStorage.set = function(vName, vValue)
{
  if (!QxUtil.isValid(vValue)) {
    return QxCookieStorage.del(vName);
  };

  var vAll = QxCookieStorage._getAll();
  vAll[vName] = vValue;
  this._setAll(vAll);
};

QxCookieStorage.get = function(vName)
{
  var vAll = QxCookieStorage._getAll();

  var vValue = QxCookieStorage._getAll()[vName];
  if (QxUtil.isValidString(vValue)) {
    return vValue;
  };

  return QxConst.CORE_EMPTY;
};

QxCookieStorage.del = function(vName)
{
  var vAll = QxCookieStorage._getAll();
  delete vAll[vName];
  this._setAll(vAll);
};

QxCookieStorage.setAll = function(vHash)
{
  var vAll = QxCookieStorage._getAll();
  vAll = QxUtil.mergeWithObject(vAll, vHash);
  QxCookieStorage._setAll(vAll);
};

QxCookieStorage.getAll = function() {
  return QxCookieStorage._getAll();
};

QxCookieStorage.replaceAll = function(vHash) {
  QxCookieStorage._setAll(vHash);
};

QxCookieStorage.delAll = function() {
  QxCookieStorage.replaceAll({});
};





/*
---------------------------------------------------------------------------
  LOW LEVEL INTERNAL METHODS
---------------------------------------------------------------------------
*/

QxCookieStorage._getAll = function()
{
  var vHash = {};
  var vCookie, vItems, vItem;

  for (var i=0; i<QxCookieStorage.MAXCOOKIES; i++)
  {
    vCookie = QxCookie.get(QxCookieStorage.BASENAME + i);
    if (vCookie)
    {
      vItems = vCookie.split(QxCookieStorage.ITEMSEPARATOR);
      for (var j=0, l=vItems.length; j<l; j++)
      {
        vItem = vItems[j].split(QxCookieStorage.KEYVALUESEPARATOR);
        vHash[vItem[0]] = vItem[1];
      };
    };
  };

  return vHash;
};

QxCookieStorage._setAll = function(vHash)
{
  var vString = QxConst.CORE_EMPTY;
  var vTemp;
  var vIndex = 0;

  for (var vName in vHash)
  {
    vTemp = vName + QxCookieStorage.KEYVALUESEPARATOR + vHash[vName];

    if (vTemp.length > QxCookieStorage.MAXSIZE)
    {
      QxDebug("QxCookieStorage", "Could not store value of name '" + vName + "': Maximum size of " + QxCookieStorage.MAXSIZE + "reached!");
      continue;
    };

    if ((QxCookieStorage.ITEMSEPARATOR.length + vString.length + vTemp.length) > QxCookieStorage.MAXSIZE)
    {
      QxCookieStorage._setCookie(vIndex++, vString);

      if (vIndex == QxCookieStorage.MAXCOOKIES)
      {
        QxDebug("QxCookieStorage", "Failed to store cookie. Max cookie amount reached!", "error");
        return false;
      };

      vString = vTemp;
    }
    else
    {
      if (vString != QxConst.CORE_EMPTY) {
        vString += QxCookieStorage.ITEMSEPARATOR;
      };

      vString += vTemp;
    };
  };

  if (vString != QxConst.CORE_EMPTY) {
    QxCookieStorage._setCookie(vIndex++, vString);
  };

  while (vIndex < QxCookieStorage.MAXCOOKIES) {
    QxCookieStorage._delCookie(vIndex++);
  };
};

QxCookieStorage._setCookie = function(vIndex, vString)
{
  // QxDebug("QxCookieStorage", "Store: " + vIndex + " = " + vString);
  QxCookie.set(QxCookieStorage.BASENAME + vIndex, vString);
};

QxCookieStorage._delCookie = function(vIndex)
{
  // QxDebug("QxCookieStorage", "Delete: " + vIndex);
  QxCookie.del(QxCookieStorage.BASENAME + vIndex);
};
