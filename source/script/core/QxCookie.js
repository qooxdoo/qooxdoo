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

var QxCookie =
{
  STR_EXPIRES : "expires",
  STR_PATH : "path",
  STR_DOMAIN : "domain",
  STR_SECURE : "secure",
  STR_DELDATA : "Thu, 01-Jan-1970 00:00:01 GMT"
};





/*
---------------------------------------------------------------------------
  USER APPLICATION METHODS
---------------------------------------------------------------------------
*/

QxCookie.get = function(vName)
{
  var start = document.cookie.indexOf(vName + QxConst.CORE_EQUAL);
  var len = start + vName.length + 1;

  if ((!start) && (vName != document.cookie.substring(0, vName.length))) {
    return null;
  };

  if (start == -1) {
    return null;
  };

  var end = document.cookie.indexOf(QxConst.CORE_SEMICOLON, len);

  if (end == -1) {
    end = document.cookie.length;
  };

  return unescape(document.cookie.substring(len, end));
};

QxCookie.set = function(vName, vValue, vExpires, vPath, vDomain, vSecure)
{
  var today = new Date();
  today.setTime(today.getTime());

  // Generate cookie
  var vCookie = [ vName, QxConst.CORE_EQUAL, escape(vValue) ];

  if (vExpires)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_EXPIRES);
    vCookie.push(QxConst.CORE_EQUAL);
    vCookie.push(new Date(today.getTime() + (vExpires * 1000 * 60 * 60 * 24)).toGMTString());
  };

  if (vPath)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_PATH);
    vCookie.push(QxConst.CORE_EQUAL);
    vCookie.push(vPath);
  };

  if (vDomain)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_DOMAIN);
    vCookie.push(QxConst.CORE_EQUAL);
    vCookie.push(vDomain);
  };

  if (vSecure)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_SECURE);
  };

  // Store cookie
  document.cookie = vCookie.join(QxConst.CORE_EMPTY);
};

QxCookie.del = function(vName, vPath, vDomain)
{
  if (!QxCookie.get(vName)) {
    return;
  };

  // Generate cookie
  var vCookie = [ vName, QxConst.CORE_EQUAL ];

  if (vPath)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_PATH);
    vCookie.push(QxConst.CORE_EQUAL);
    vCookie.push(vPath);
  };

  if (vDomain)
  {
    vCookie.push(QxConst.CORE_SEMICOLON);
    vCookie.push(QxCookie.STR_DOMAIN);
    vCookie.push(QxConst.CORE_EQUAL);
    vCookie.push(vDomain);
  };

  vCookie.push(QxConst.CORE_SEMICOLON);
  vCookie.push(QxCookie.STR_EXPIRES);
  vCookie.push(QxConst.CORE_EQUAL);
  vCookie.push(QxCookie.STR_DELDATA);

  // Store cookie
  document.cookie = vCookie.join(QxConst.CORE_EMPTY);
};
