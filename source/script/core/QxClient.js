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

#package(core)
#require(QxExtend)

************************************************************************ */

/*!
  Basic client detection implementation

  Version shemes following wikipedia: major.minor[.revision[.build]]
  http://en.wikipedia.org/wiki/Software_version
*/
function QxClient()
{
  var vRunsLocally = window.location.protocol === "file:";

  var vBrowserUserAgent = navigator.userAgent;
  var vBrowserVendor = navigator.vendor;
  var vBrowserProduct = navigator.product;
  var vBrowserPlatform = navigator.platform;
  var vBrowserModeHta = false;

  var vEngine = null;
  var vEngineVersion = null;
  var vEngineVersionMajor = 0;
  var vEngineVersionMinor = 0;
  var vEngineVersionRevision = 0;
  var vEngineVersionBuild = 0;

  var vEngineEmulation = null;
  var vVersionHelper;

  if (window.opera && /Opera[\s\/]([0-9\.]*)/.test(vBrowserUserAgent))
  {
    vEngine = "opera";
    vEngineVersion = RegExp.$1;

    // Fix Opera version to match wikipedia style
    vEngineVersion = vEngineVersion.substring(0, 3) + "." + vEngineVersion.substring(3);

    vEngineEmulation = vBrowserUserAgent.indexOf("MSIE") !== -1 ? "mshtml" : vBrowserUserAgent.indexOf("Mozilla") !== -1 ? "gecko" : null;
  }
  else if (typeof vBrowserVendor==="string" && vBrowserVendor==="KDE")
  {
    vEngine = "khtml";
  }
  else if (window.controllers && typeof vBrowserProduct==="string" && vBrowserProduct==="Gecko" && /rv\:([^\);]+)(\)|;)/.test(vBrowserUserAgent))
  {
    // http://www.mozilla.org/docs/dom/domref/dom_window_ref13.html
    vEngine = "gecko";
    vEngineVersion = RegExp.$1;
  }
  else if (/MSIE\s+([^\);]+)(\)|;)/.test(vBrowserUserAgent))
  {
    vEngine = "mshtml";
    vEngineVersion = RegExp.$1;

    vBrowserModeHta = !window.external;
  };

  // Support Konqueror?
  // Mozilla/5.0 (compatible; Konqueror/3.5) KHTML/3.5.0 (like Gecko)

  if (vEngineVersion)
  {
    vVersionHelper = vEngineVersion.split(".");

    vEngineVersionMajor = vVersionHelper[0] || 0;
    vEngineVersionMinor = vVersionHelper[1] || 0;
    vEngineVersionRevision = vVersionHelper[2] || 0;
    vEngineVersionBuild = vVersionHelper[3] || 0;
  };

  this._runsLocally = vRunsLocally;

  this._engineName = vEngine;
  this._engineNameMshtml = vEngine === "mshtml";
  this._engineNameGecko = vEngine === "gecko";
  this._engineNameOpera = vEngine === "opera";
  this._engineNameKhtml = vEngine === "khtml";

  this._engineVersion = parseFloat(vEngineVersion);
  this._engineVersionMajor = parseInt(vEngineVersionMajor);
  this._engineVersionMinor = parseInt(vEngineVersionMinor);
  this._engineVersionRevision = parseInt(vEngineVersionRevision);
  this._engineVersionBuild = parseInt(vEngineVersionBuild);

  this._engineQuirksMode = document.compatMode !== "CSS1Compat";
  this._engineEmulation = vEngineEmulation;

  this._browserPlatform = vBrowserPlatform;
  this._browserModeHta = vBrowserModeHta;
};

QxClient.extend(Object, "QxClient");





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

proto.getRunsLocally = function() {
  return this._runsLocally;
};

proto.getEngine = function() {
  return this._engineName;
};

proto.getVersion = function() {
  return this._engineVersion;
};

proto.getMajor = function() {
  return this._engineVersionMajor;
};

proto.getMinor = function() {
  return this._engineVersionMinor;
};

proto.getRevision = function() {
  return this._engineVersionRevision;
};

proto.getBuild = function() {
  return this._engineVersionBuild;
};

proto.getEmulation = function() {
  return this._engineEmulation;
};

proto.isMshtml = function() {
  return this._engineNameMshtml;
};

proto.isGecko = function() {
  return this._engineNameGecko;
};

proto.isOpera = function() {
  return this._engineNameOpera;
};

proto.isKhtml = function() {
  return this._engineNameKhtml;
};

proto.isInQuirksMode = function() {
  return this._engineQuirksMode;
};






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxClient = new QxClient;
