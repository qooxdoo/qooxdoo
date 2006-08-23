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

#module(core)

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
  var vBrowser;

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
    vBrowser = "konqueror";
  }
  else if (vBrowserUserAgent.indexOf("Safari") != -1)
  {
    vEngine = "webkit";
    vBrowser = "safari";
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
  }

  // Support Konqueror?
  // Mozilla/5.0 (compatible; Konqueror/3.5) KHTML/3.5.0 (like Gecko)

  if (vEngineVersion)
  {
    vVersionHelper = vEngineVersion.split(".");

    vEngineVersionMajor = vVersionHelper[0] || 0;
    vEngineVersionMinor = vVersionHelper[1] || 0;
    vEngineVersionRevision = vVersionHelper[2] || 0;
    vEngineVersionBuild = vVersionHelper[3] || 0;
  }

  var vEngineBoxSizingAttr = vEngine == "gecko" ? "-moz-box-sizing" : vEngine == "mshtml" ? null : "box-sizing";
  var vEngineQuirksMode = document.compatMode !== "CSS1Compat";

  var vDefaultLocale = "en";
  var vBrowserLocale = (vEngine == "mshtml" ? navigator.userLanguage : navigator.language).toLowerCase();

  var vPlatformWindows = vBrowserPlatform.indexOf("Windows") != -1;
  var vPlatformMacintosh = (vBrowserPlatform.indexOf("Macintosh") != -1 ||
                            vBrowserPlatform.indexOf("MacIntel") != -1);
  var vPlatformX11 = vBrowserPlatform.indexOf("X11") != -1;

  var vGfxVml = false;
  var vGfxSvg = false;
  var vGfxSvgBuiltin = false;
  var vGfxSvgPlugin = false;

  if (vEngine == "mshtml")
  {
    vGfxVml = true;

    // TODO: Namespace for VML:
    // document.write('<style>v\:*{ behavior:url(#default#VML); }</style>');
    // document.write('<xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>');
  }

  if (document.implementation && document.implementation.hasFeature)
  {
    if (document.implementation.hasFeature("org.w3c.dom.svg", "1.0"))
    {
      vGfxSvg = vGfxSvgBuiltin = true;
    }
  }





  this._runsLocally = vRunsLocally;

  this._engineName = vEngine;
  this._engineNameMshtml = vEngine === "mshtml";
  this._engineNameGecko = vEngine === "gecko";
  this._engineNameOpera = vEngine === "opera";
  this._engineNameKhtml = vEngine === "khtml";
  this._engineNameWebkit = vEngine === "webkit";

  this._engineVersion = parseFloat(vEngineVersion);
  this._engineVersionMajor = parseInt(vEngineVersionMajor);
  this._engineVersionMinor = parseInt(vEngineVersionMinor);
  this._engineVersionRevision = parseInt(vEngineVersionRevision);
  this._engineVersionBuild = parseInt(vEngineVersionBuild);

  this._engineQuirksMode = vEngineQuirksMode;
  this._engineBoxSizingAttribute = vEngineBoxSizingAttr;
  this._engineEmulation = vEngineEmulation;

  this._defaultLocale = vDefaultLocale;

  this._browserPlatform = vBrowserPlatform;
  this._browserPlatformWindows = vPlatformWindows;
  this._browserPlatformMacintosh = vPlatformMacintosh;
  this._browserPlatformX11 = vPlatformX11;
  this._browserModeHta = vBrowserModeHta;
  this._browserLocale = vBrowserLocale;

  this._gfxVml = vGfxVml;
  this._gfxSvg = vGfxSvg;
  this._gfxSvgBuiltin = vGfxSvgBuiltin;
  this._gfxSvgPlugin = vGfxSvgPlugin;
});





/*
---------------------------------------------------------------------------
  METHODS
---------------------------------------------------------------------------
*/

qx.Proto.getRunsLocally = function() {
  return this._runsLocally;
}

qx.Proto.getEngine = function() {
  return this._engineName;
}

qx.Proto.getVersion = function() {
  return this._engineVersion;
}

qx.Proto.getMajor = function() {
  return this._engineVersionMajor;
}

qx.Proto.getMinor = function() {
  return this._engineVersionMinor;
}

qx.Proto.getRevision = function() {
  return this._engineVersionRevision;
}

qx.Proto.getBuild = function() {
  return this._engineVersionBuild;
}

qx.Proto.getEmulation = function() {
  return this._engineEmulation;
}

qx.Proto.isMshtml = function() {
  return this._engineNameMshtml;
}

qx.Proto.isGecko = function() {
  return this._engineNameGecko;
}

qx.Proto.isOpera = function() {
  return this._engineNameOpera;
}

qx.Proto.isKhtml = function() {
  return this._engineNameKhtml;
}

qx.Proto.isWebkit = function() {
  return this._engineNameWebkit;
}

qx.Proto.isInQuirksMode = function() {
  return this._engineQuirksMode;
}

qx.Proto.getLocale = function() {
  return this._browserLocale;
}

qx.Proto.getDefaultLocale = function() {
  return this._defaultLocale;
}

qx.Proto.usesDefaultLocale = function() {
  return this._browserLocale === this._defaultLocale;
}



/**
 * Returns the CSS attribute name for box-sizing if supported.
 *
 * @return {string} the attribute name.
 */
qx.Proto.getEngineBoxSizingAttribute = function() {
  return this._engineBoxSizingAttribute;
}


/**
 * Returns whether the client platform is a Windows machine.
 *
 * @return {boolean} whether the client platform is a Windows.
 */
qx.Proto.runsOnWindows = function() {
  return this._browserPlatformWindows;
}

/**
 * Returns whether the client platform is a Macintosh machine.
 *
 * @return {boolean} whether the client platform is a Macintosh.
 */
qx.Proto.runsOnMacintosh = function() {
  return this._browserPlatformMacintosh;
}

/**
 * Returns whether the client platform is a X11 powered machine.
 *
 * @return {boolean} whether the client platform is a X11 powered machine.
 */
qx.Proto.runsOnX11 = function() {
  return this._browserPlatformX11;
}

qx.Proto.supportsVml = function() {
  return this._gfxVml;
}

qx.Proto.supportsSvg = function() {
  return this._gfxSvg;
}

qx.Proto.usesSvgBuiltin = function() {
  return this._gfxSvgBuiltin;
}

qx.Proto.usesSvgPlugin = function() {
  return this._gfxSvgPlugin;
}






/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = qx.util.Return.returnInstance;
