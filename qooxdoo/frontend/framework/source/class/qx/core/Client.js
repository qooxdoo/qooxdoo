/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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
#ignore(auto-require)
#require(qx.core.Variant)

************************************************************************ */

/**
 * Basic client detection implementation.
 *
 * Version names follow the wikipedia scheme: major.minor[.revision[.build]] at
 * http://en.wikipedia.org/wiki/Software_version
 */
qx.Class.define("qx.core.Client",
{
  statics :
  {

    /**
     * Initializer for the static class called by defer
     */
    __init : function()
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
      var vEngineNightly = null;
      var vVersionHelper;

      if (window.opera && /Opera[\s\/]([0-9\.]*)/.test(vBrowserUserAgent))
      {
        vEngine = "opera";
        vEngineVersion = RegExp.$1;
        vBrowser = "opera";

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
      else if (vBrowserUserAgent.indexOf("AppleWebKit") != -1 && /AppleWebKit\/([^ ]+)/.test(vBrowserUserAgent))
      {
        vEngine = "webkit";
        vEngineVersion = RegExp.$1;
        vEngineNightly = vEngineVersion.indexOf("+") != -1;

        var invalidCharacter = RegExp("[^\\.0-9]").exec(vEngineVersion);
        if (invalidCharacter) {
          vEngineVersion = vEngineVersion.slice(0, invalidCharacter.index);
        }

        if (vBrowserUserAgent.indexOf("Safari") != -1) {
          vBrowser = "safari";
        } else if (vBrowserUserAgent.indexOf("OmniWeb") != -1) {
          vBrowser = "omniweb";
        } else if (vBrowserUserAgent.indexOf("Shiira") != -1) {
          vBrowser = "shiira";
        } else if (vBrowserUserAgent.indexOf("NetNewsWire") != -1) {
          vBrowser = "netnewswire";
        } else if (vBrowserUserAgent.indexOf("RealPlayer") != -1) {
          vBrowser = "realplayer";
        } else {
          vBrowser = "other webkit";
        }

        if (vEngineNightly) {
          vBrowser += " (nightly)"
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
        vBrowser = "explorer";

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

      var vEngineBoxSizingAttr = [];
      switch (vEngine)
      {
        case "gecko":
          vEngineBoxSizingAttr.push("-moz-box-sizing");
          break;

        case "khtml":
          vEngineBoxSizingAttr.push("-khtml-box-sizing");
          break;

        case "webkit":
          vEngineBoxSizingAttr.push("-khtml-box-sizing");
          vEngineBoxSizingAttr.push("-webkit-box-sizing");
          break;

        case "mshtml":
          break;

        default:
          break;
      }
      vEngineBoxSizingAttr.push("box-sizing");

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
      this._engineBoxSizingAttributes = vEngineBoxSizingAttr;
      this._engineEmulation = vEngineEmulation;

      this._browserName = vBrowser;

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

      this._supportsXPath = !!document.evaluate;
      this._supportsElementExtensions = !!window.HTMLElement;
    },


    /**
     * Returns whether the client runs locally (uses the "file:" protocol)
     *
     * @type member
     * @return {Boolean} if the client runs locally
     */
    getRunsLocally : function() {
      return this._runsLocally;
    },


    /**
     * Engine identifier
     *
     * @type member
     * @return {String} the engine identifier
     */
    getEngine : function() {
      return this._engineName;
    },


    /**
     * Browser name (e.g. firefox, explorer, webkit, opera etc.)
     *
     * @type member
     * @return {String} the name of the browser
     */
    getBrowser : function() {
      return this._browserName;
    },


    /**
     * Full qualified engine version
     *
     * @type member
     * @return {String} full qualified engine version
     */
    getVersion : function() {
      return this._engineVersion;
    },


    /**
     * Major engine version
     *
     * @type member
     * @return {Number} major engine version
     */
    getMajor : function() {
      return this._engineVersionMajor;
    },


    /**
     * Minor engine version
     *
     * @type member
     * @return {Number} minor engine version
     */
    getMinor : function() {
      return this._engineVersionMinor;
    },


    /**
     * Revision number of engine version
     *
     * @type member
     * @return {Number} revision number of engine version
     */
    getRevision : function() {
      return this._engineVersionRevision;
    },


    /**
     * Build number of engine version
     *
     * @type member
     * @return {Number} build number of engine version
     */
    getBuild : function() {
      return this._engineVersionBuild;
    },


    /**
     * Detects Opera's engine emulation
     *
     * @type member
     * @return {String} detects Opera's engine emulation
     */
    getEmulation : function() {
      return this._engineEmulation;
    },


    /**
     * Returns whether the engine is mshtml
     *
     * @type member
     * @return {Boolean} if engine is mshtml
     */
    isMshtml : function() {
      return this._engineNameMshtml;
    },


    /**
     * Returns whether the engine is gecko
     *
     * @type member
     * @return {Boolean} if engine is gecko
     */
    isGecko : function() {
      return this._engineNameGecko;
    },


    /**
     * Returns whether the engine is opera
     *
     * @type member
     * @return {Boolean} if engine is opera
     */
    isOpera : function() {
      return this._engineNameOpera;
    },


    /**
     * Returns whether the engine is khtml
     *
     * @type member
     * @return {Boolean} if engine is khtml
     */
    isKhtml : function() {
      return this._engineNameKhtml;
    },


    /**
     * Returns whether the engine is webkit
     *
     * @type member
     * @return {Boolean} if engine is webkit
     */
    isWebkit : function() {
      return this._engineNameWebkit;
    },


    /**
     * Returns whether the engine is a safari version 2
     *
     * @type member
     * @return {Boolean} if engine is safari version 2
     */
    isSafari2 : function() {
      return this._engineNameWebkit && (this._engineVersion < 420);
    },


    /**
     * Returns whether the engine is in quirksmode
     *
     * @type member
     * @return {Boolean} if engine is in quirksmode
     */
    isInQuirksMode : function() {
      return this._engineQuirksMode;
    },


    /**
     * Returns the locale setting
     *
     * @type member
     * @return {String} locale setting
     */
    getLocale : function() {
      return this._browserLocale;
    },


    /**
     * Returns the locale variant setting
     *
     * @type member
     * @return {String} locale variant setting
     */
    getLocaleVariant : function() {
      return this._browserLocaleVariant;
    },


    /**
     * Returns the default locale of qooxdoo
     *
     * @type member
     * @return {String} default locale of qooxdoo
     */
    getDefaultLocale : function() {
      return this._defaultLocale;
    },


    /**
     * Returns whether the client uses the default locale of qooxdoo
     *
     * @type member
     * @return {Boolean} if browsers use default locale of qooxdoo
     */
    usesDefaultLocale : function() {
      return this._browserLocale === this._defaultLocale;
    },


    /**
     * Returns the CSS attribute names for box-sizing if supported.
     *
     * @type member
     * @return {String[]} the attribute names.
     */
    getEngineBoxSizingAttributes : function() {
      return this._engineBoxSizingAttributes;
    },


    /**
     * Returns the client platform (e.g. unix, windows, mac etc.)
     *
     * @type member
     * @return {String} browser platform
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
     * Returns whether the client supports VML (Vector Markup Language)
     *
     * @type member
     * @return {Boolean} whether the client supports VML
     */
    supportsVml : function() {
      return this._gfxVml;
    },


    /**
     * Returns whether the client supports SVG (Scalable Vector Graphics)
     *
     * @type member
     * @return {Boolean} whether the client supports SVG
     */
    supportsSvg : function() {
      return this._gfxSvg;
    },


    /**
     * Returns whether SVG support is builtin
     *
     * @type member
     * @return {Boolean} whether SVG support is builtin
     */
    usesSvgBuiltin : function() {
      return this._gfxSvgBuiltin;
    },


    /**
     * Returns whether the client uses a SVG plugin
     *
     * @type member
     * @return {Boolean} whether client uses a SVG plugin
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
    },


    /**
     * Singleton getter for keep compatibility
     * @deprecated
     * @return {Client} reference to the static class.
     */
    getInstance: function() {
      return this;
    }

  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    statics.__init();
    qx.core.Variant.define("qx.client", [ "gecko", "mshtml", "opera", "webkit", "khtml" ], qx.core.Client.getInstance().getEngine());
  }
});
