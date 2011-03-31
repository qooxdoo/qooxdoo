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
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's engine.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Engine",
{
  // General: http://en.wikipedia.org/wiki/Browser_timeline
  // Webkit: http://developer.apple.com/internet/safari/uamatrix.html
  // Firefox: http://en.wikipedia.org/wiki/History_of_Mozilla_Firefox
  statics :
  {
    /**
     * {String} Name of the client's HTML/JS engine e.g. mshtml, gecko, webkit, opera, khtml
     * @deprecated since 1.4: See qx.core.Environment
     */
    NAME : "",

    /**
     * {String} Full version string with multiple dots (major.minor.revision) e.g. 1.8.1, 8.5.4 #
     * @deprecated since 1.4: See qx.core.Environment
     */
    FULLVERSION : "0.0.0",

    /**
     * {Float} Version of the client's HTML/JS engine e.g. 1.0, 1.7, 1.9
     * @deprecated since 1.4: See qx.core.Environment
     */
    VERSION : 0.0,

    /**
     * {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine
     * @deprecated since 1.4: See qx.core.Environment
     */
    OPERA : false,

    /**
     * {Boolean} Flag to detect if the client is based on the Webkit HTML/JS engine
     * @deprecated since 1.4: See qx.core.Environment
     */
    WEBKIT : false,

    /**
     * {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine
     * @deprecated since 1.4: See qx.core.Environment
     */
    GECKO : false,

    /**
     * {Boolean} Flag to detect if the client is based on the Internet Explorer HTML/JS engine
     * @deprecated since 1.4: See qx.core.Environment
     */
    MSHTML : false,

    /**
     * {Boolean} Flag to detect if the client engine is assumed
     * @deprecated since 1.4: See qx.core.Environment
     */
    UNKNOWN_ENGINE : false,

    /**
     * {Boolean} Flag to detect if the client engine version is assumed
     * @deprecated since 1.4: See qx.core.Environment
     */
    UNKNOWN_VERSION: false,

    /**
     * {Integer|null} Flag to detect the document mode from the Internet Explorer 8
     *
     * <code>null</code> The document mode is not supported.
     * <code>5</code> Microsoft Internet Explorer 5 mode (also known as "quirks mode").
     * <code>7</code> Internet Explorer 7 Standards mode.
     * <code>8</code> Internet Explorer 8 Standards mode.
     *
     * @deprecated since 1.4: See qx.core.Environment
     */
    DOCUMENT_MODE : null,

    /**
     * Returns the version of the engine.
     *
     * @return {String} The version number of the current engine.
     * @internal
     */
    getVersion : function() {
      var agent = window.navigator.userAgent;

      var version = "";
      if (qx.bom.client.Engine.__isOpera()) {
        // Opera has a special versioning scheme, where the second part is combined
        // e.g. 8.54 which should be handled like 8.5.4 to be compatible to the
        // common versioning system used by other browsers
        if (/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(agent))
        {
          version = RegExp.$1 + "." + RegExp.$2;
          if (RegExp.$3 != "") {
            version += "." + RegExp.$3;
          }
        }
      } else if (qx.bom.client.Engine.__isWebkit()) {
        if (/AppleWebKit\/([^ ]+)/.test(agent))
        {
          version = RegExp.$1;

          // We need to filter these invalid characters
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);

          if (invalidCharacter) {
            version = version.slice(0, invalidCharacter.index);
          }
        }
      } else if (qx.bom.client.Engine.__isGecko()) {
        // Parse "rv" section in user agent string
        if (/rv\:([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;
        }
      } else if (qx.bom.client.Engine.__isMshtml()) {
        if (/MSIE\s+([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;

          // If the IE8 or IE9 is running in the compatibility mode, the MSIE value
          // is set to an older version, but we need the correct version. The only
          // way is to compare the trident version.
          if (version < 8 && /Trident\/([^\);]+)(\)|;)/.test(agent)) {
            if (RegExp.$1 == "4.0") {
              version = "8.0";
            } else if (RegExp.$1 == "5.0") {
              version = "9.0";
            }
          }
        }
      } else {
        var failFunction = window.qxFail;
        if (failFunction && typeof failFunction === "function") {
          version = failFunction().FULLVERSION;
        } else {
          version = "1.9.0.0";
          qx.Bootstrap.warn("Unsupported client: " + agent
            + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        }
      }

      return version;
    },


    /**
     * Returns the name of the engine.
     *
     * @return {String} The name of the current engine.
     * @internal
     */
    getName : function() {
      var name;
      if (qx.bom.client.Engine.__isOpera()) {
        name = "opera";
      } else if (qx.bom.client.Engine.__isWebkit()) {
        name = "webkit";
      } else if (qx.bom.client.Engine.__isGecko()) {
        name = "gecko";
      } else if (qx.bom.client.Engine.__isMshtml()) {
        name = "mshtml";
      } else {
        // check for the fallback
        var failFunction = window.qxFail;
        if (failFunction && typeof failFunction === "function") {
          name = failFunction().NAME;
        } else {
          name = "gecko";
          qx.Bootstrap.warn("Unsupported client: " + window.navigator.userAgent
            + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        }
      }
      return name;
    },


    /**
     * Internal helper for checking for opera.
     * @return {boolean} true, if its opera.
     */
    __isOpera : function() {
      return window.opera &&
        Object.prototype.toString.call(window.opera) == "[object Opera]";
    },


    /**
     * Internal helper for checking for webkit.
     * @return {boolean} true, if its webkit.
     */
    __isWebkit : function() {
      return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
    },


    /**
     * Internal helper for checking for gecko.
     * @return {boolean} true, if its gecko.
     */
    __isGecko : function() {
      return window.controllers && window.navigator.product === "Gecko";
    },


    /**
     * Internal helper to check for MSHTML.
     * @return {boolean} true, if its MSHTML.
     */
    __isMshtml : function() {
      return window.navigator.cpuClass &&
        /MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent);
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  /**
   * @lint ignoreUndefined(qxvariants)
   */
  defer : function(statics) {
    // @deprecated since 1.4: all code in the defer
    statics.NAME = statics.getName();

    // check the version
    statics.FULLVERSION = statics.getVersion();
    if (statics.FULLVERSION == "") {
      statics.UNKNOWN_VERSION = true;
    }

    if (statics.__isOpera()) {
      statics.OPERA = true;
      if (statics.FULLVERSION == "") {
        statics.FULLVERSION = "9.6.0";
      }
    } else if (statics.__isWebkit()) {
      statics.WEBKIT = true;
      if (statics.FULLVERSION == "") {
        statics.FULLVERSION = "525.26";
      }
    } else if (statics.__isGecko()) {
      statics.GECKO = true;
      if (statics.FULLVERSION == "") {
        statics.FULLVERSION = "1.9.0.0";
      }
    } else if (statics.__isMshtml()) {
      statics.MSHTML = true;
      if (document.documentMode) {
        statics.DOCUMENT_MODE = document.documentMode;
      }
    } else {
      // check for the fallback
      var failFunction = window.qxFail;
      if (failFunction && typeof failFunction === "function") {
        if (failFunction().NAME) {
          statics[failFunction().NAME.toUpperCase()] = true;
        }
      } else {
        statics.GECKO = true;
        statics.UNKNOWN_ENGINE = true;
        statics.UNKNOWN_VERSION = true;
      }
    }

    statics.VERSION = parseFloat(statics.FULLVERSION);

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // add deprecation warnings
      var keys = ["NAME", "FULLVERSION","VERSION","OPERA","WEBKIT",
        "GECKO","MSHTML","UNKNOWN_ENGINE","UNKNOWN_VERSION","DOCUMENT_MODE"];
      for (var i = 0; i < keys.length; i++) {
        // check if __defineGetter__ is available
        if (statics.__defineGetter__) {
          var constantValue = statics[keys[i]];
          statics.__defineGetter__(keys[i], qx.Bootstrap.bind(function(key, c) {
            var warning =
              "The constant '"+ key + "' of '" + statics.classname + "'is deprecated: " +
              "Please check the API documentation of qx.core.Environment."
            if (qx.dev && qx.dev.StackTrace) {
              warning += "\nTrace:" + qx.dev.StackTrace.getStackTrace().join("\n")
            }
            qx.Bootstrap.warn(warning);
            return c;
          }, statics, keys[i], constantValue));
        }
      }
    }
  }
});