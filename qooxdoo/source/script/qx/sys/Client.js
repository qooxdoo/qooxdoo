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
#require(qx.OO)

************************************************************************ */

/*!
  Basic client detection implementation

  Version shemes following wikipedia: major.minor[.revision[.build]]
  http://en.wikipedia.org/wiki/Software_version
*/
qx.OO.defineClass("qx.sys.Client", Object, 
function()
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

  this._browserPlatformNameMac = vBrowserUserAgent.indexOf("Macintosh") != -1;
  
  this._boxSizingAttribute = this._engineNameGecko ? "-moz-box-sizing" : "box-sizing";
});





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.getRunsLocally = function() {
  return this._runsLocally;
};

qx.Proto.getEngine = function() {
  return this._engineName;
};

qx.Proto.getVersion = function() {
  return this._engineVersion;
};

qx.Proto.getMajor = function() {
  return this._engineVersionMajor;
};

qx.Proto.getMinor = function() {
  return this._engineVersionMinor;
};

qx.Proto.getRevision = function() {
  return this._engineVersionRevision;
};

qx.Proto.getBuild = function() {
  return this._engineVersionBuild;
};

qx.Proto.getEmulation = function() {
  return this._engineEmulation;
};

qx.Proto.isMshtml = function() {
  return this._engineNameMshtml;
};

qx.Proto.isGecko = function() {
  return this._engineNameGecko;
};

qx.Proto.isOpera = function() {
  return this._engineNameOpera;
};

qx.Proto.isKhtml = function() {
  return this._engineNameKhtml;
};

qx.Proto.isInQuirksMode = function() {
  return this._engineQuirksMode;
};


/**
 * Returns the CSS attribute name for box-sizing.
 *
 * @return {string} the attribute name.
 */
qx.Proto.getBoxSizingAttribute = function() {
  return this._boxSizingAttribute;
};


/**
 * Returns whether the client platform is a Mac.
 *
 * @return {boolean} whether the client platform is a Mac.
 */
qx.Proto.isMac = function() {
  return this._browserPlatformNameMac;
};






/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.sys.Client = new qx.sys.Client;
