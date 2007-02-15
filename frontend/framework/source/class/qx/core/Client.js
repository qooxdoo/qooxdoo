/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * Basic client detection implementation
 * 
 *  Version shemes following wikipedia: major.minor[.revision[.build]]
 *  http://en.wikipedia.org/wiki/Software_version
 */
qx.Clazz.define("qx.core.Client",
{
  type : "singleton",
  extend : Object,








  /*
  *****************************************************************************
  **** CONSTRUCTOR ************************************************************
  *****************************************************************************
  */

  /**
   * TODOC
   *
   * @type constructor
   */
  construct : function()
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
    else if (typeof vBrowserVendor === "string" && vBrowserVendor === "KDE" && /KHTML\/([0-9-\.]*)/.test(vBrowserUserAgent))
    {
      vEngine = "khtml";
      vBrowser = "konqueror";
      vEngineVersion = RegExp.$1;
    }
    else if (vBrowserUserAgent.indexOf("AppleWebKit") != -1 && /AppleWebKit\/([0-9-\.]*)/.test(vBrowserUserAgent))
    {
      vEngine = "webkit";
      vEngineVersion = RegExp.$1;

      if (vBrowserUserAgent.indexOf("Safari") != -1) {
        vBrowser = "safari";
      } else if (vBrowserUserAgent.indexOf("Omni") != -1) {
        vBrowser = "omniweb";
      } else {
        vBrowser = "other webkit";
      }
    }
    else if (window.controllers && typeof vBrowserProduct === "string" && vBrowserProduct === "Gecko" && /rv\:([^\);]+)(\)|;)/.test(vBrowserUserAgent))
    {
      // http://www.mozilla.org/docs/dom/domref/dom_window_ref13.html
      vEngine = "gecko";
      vEngineVersion = RegExp.$1;

      if (vBrowserUserAgent.indexOf("Firefox") != -1) {
        vBrowser = "firefox";
      } else if (vBrowserUserAgent.indexOf("Camino") != -1) {
        vBrowser = "camino";
      } else if (vBrowserUserAgent.indexOf("Galeon") != -1) {
        vBrowser = "galeon";
      } else {
        vBrowser = "other gecko";
      }
    }
    else if (/MSIE\s+([^\);]+)(\)|;)/.test(vBrowserUserAgent))
    {
      vEngine = "mshtml";
      vEngineVersion = RegExp.$1;

      vBrowserModeHta = !window.external;
    }

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
    var vBrowserLocaleVariant = null;

    var vBrowserLocaleVariantIndex = vBrowserLocale.indexOf("-");

    if (vBrowserLocaleVariantIndex != -1)
    {
      vBrowserLocaleVariant = vBrowserLocale.substr(vBrowserLocaleVariantIndex + 1);
      vBrowserLocale = vBrowserLocale.substr(0, vBrowserLocaleVariantIndex);
    }

    var vPlatform = "none";
    var vPlatformWindows = false;
    var vPlatformMacintosh = false;
    var vPlatformUnix = false;
    var vPlatformOther = false;

    if (vBrowserPlatform.indexOf("Windows") != -1 || vBrowserPlatform.indexOf("Win32") != -1 || vBrowserPlatform.indexOf("Win64") != -1)
    {
      vPlatformWindows = true;
      vPlatform = "win";
    }
    else if (vBrowserPlatform.indexOf("Macintosh") != -1 || vBrowserPlatform.indexOf("MacPPC") != -1 || vBrowserPlatform.indexOf("MacIntel") != -1)
    {
      vPlatformMacintosh = true;
      vPlatform = "mac";
    }
    else if (vBrowserPlatform.indexOf("X11") != -1 || vBrowserPlatform.indexOf("Linux") != -1 || vBrowserPlatform.indexOf("BSD") != -1)
    {
      vPlatformUnix = true;
      vPlatform = "unix";
    }
    else
    {
      vPlatformOther = true;
      vPlatform = "other";
    }

    var vGfxVml = false;
    var vGfxSvg = false;
    var vGfxSvgBuiltin = false;
    var vGfxSvgPlugin = false;

    if (vEngine == "mshtml") {
      vGfxVml = true;
    }

    // TODO: Namespace for VML:
    // document.write('<style>v\:*{ behavior:url(#default#VML); }</style>');
    // document.write('<xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>');
    if (document.implementation && document.implementation.hasFeature)
    {
      if (document.implementation.hasFeature("org.w3c.dom.svg", "1.0")) {
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

    this._browserPlatform = vPlatform;
    this._browserPlatformWindows = vPlatformWindows;
    this._browserPlatformMacintosh = vPlatformMacintosh;
    this._browserPlatformUnix = vPlatformUnix;
    this._browserPlatformOther = vPlatformOther;
    this._browserModeHta = vBrowserModeHta;
    this._browserLocale = vBrowserLocale;
    this._browserLocaleVariant = vBrowserLocaleVariant;

    this._gfxVml = vGfxVml;
    this._gfxSvg = vGfxSvg;
    this._gfxSvgBuiltin = vGfxSvgBuiltin;
    this._gfxSvgPlugin = vGfxSvgPlugin;

    this._fireBugActive = (window.console && console.log && console.debug && console.assert);

    this._supportsTextContent = (document.documentElement.textContent !== undefined);
    this._supportsInnerText = (document.documentElement.innerText !== undefined);
  },








  /*
  *****************************************************************************
  **** MEMBERS ****************************************************************
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getRunsLocally : function() {
      return this._runsLocally;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getEngine : function() {
      return this._engineName;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getVersion : function() {
      return this._engineVersion;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getMajor : function() {
      return this._engineVersionMajor;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getMinor : function() {
      return this._engineVersionMinor;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getRevision : function() {
      return this._engineVersionRevision;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getBuild : function() {
      return this._engineVersionBuild;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getEmulation : function() {
      return this._engineEmulation;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isMshtml : function() {
      return this._engineNameMshtml;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isGecko : function() {
      return this._engineNameGecko;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isOpera : function() {
      return this._engineNameOpera;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isKhtml : function() {
      return this._engineNameKhtml;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isWebkit : function() {
      return this._engineNameWebkit;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isSafari2 : function() {
      return this._engineNameWebkit && (this._engineVersion < 420);
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    isInQuirksMode : function() {
      return this._engineQuirksMode;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLocale : function() {
      return this._browserLocale;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLocaleVariant : function() {
      return this._browserLocaleVariant;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getDefaultLocale : function() {
      return this._defaultLocale;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    usesDefaultLocale : function() {
      return this._browserLocale === this._defaultLocale;
    },

    /**
     * Returns the CSS attribute name for box-sizing if supported.
     *
     * @type member
     * @return {String} the attribute name.
     */
    getEngineBoxSizingAttribute : function() {
      return this._engineBoxSizingAttribute;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getPlatform : function() {
      return this._browserPlatform;
    },

    /**
     * Returns whether the client platform is a Windows machine.
     *
     * @type member
     * @return {Boolean} whether the client platform is a Windows.
     */
    runsOnWindows : function() {
      return this._browserPlatformWindows;
    },

    /**
     * Returns whether the client platform is a Macintosh machine.
     *
     * @type member
     * @return {Boolean} whether the client platform is a Macintosh.
     */
    runsOnMacintosh : function() {
      return this._browserPlatformMacintosh;
    },

    /**
     * Returns whether the client platform is a X11 powered machine.
     *
     * @type member
     * @return {Boolean} whether the client platform is a X11 powered machine.
     */
    runsOnUnix : function() {
      return this._browserPlatformUnix;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    supportsVml : function() {
      return this._gfxVml;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    supportsSvg : function() {
      return this._gfxSvg;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    usesSvgBuiltin : function() {
      return this._gfxSvgBuiltin;
    },

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    usesSvgPlugin : function() {
      return this._gfxSvgPlugin;
    },

    /**
     * Retuns whether the Mozilla FireBug extension is installed and active
     * http://www.getfirebug.com/
     *
     * @type member
     * @return {Boolean} whether FireBug is active
     */
    isFireBugActive : function() {
      return this._fireBugActive;
    },

    /**
     * Returns whether the client supports the W3C property textContent of DOM element nodes.
     *
     * @type member
     * @return {Boolean} whether the client supports textContent.
     */
    supportsTextContent : function() {
      return this._supportsTextContent;
    },

    /**
     * Returns whether the client supports the W3C property innerText of DOM element nodes.
     *
     * @type member
     * @return {Boolean} whether the client supports innerText.
     */
    supportsInnerText : function() {
      return this._supportsInnerText;
    }
  }
});


qx.core.Variant.define("qx.client", ["gecko", "mshtml", "opera", "webkit", "khtml"], qx.core.Client.getInstance().getEngine());