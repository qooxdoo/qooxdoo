/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
  // Webkit: https://developer.apple.com/internet/safari/uamatrix.html
  // Firefox: http://en.wikipedia.org/wiki/History_of_Mozilla_Firefox
  statics :
  {
    /**
     * Returns the version of the engine.
     *
     * @return {String} The version number of the current engine.
     * @internal
     */
    getVersion : function() {
      var agent = window.navigator.userAgent;

      var version = "";
      if (qx.bom.client.Engine.__isMshtml()) {
        var isTrident = /Trident\/([^\);]+)(\)|;)/.test(agent);
        if (/MSIE\s+([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;

          // If the IE8 or IE9 is running in the compatibility mode, the MSIE value
          // is set to an older version, but we need the correct version. The only
          // way is to compare the trident version.
          if (version < 8 && isTrident) {
            if (RegExp.$1 == "4.0") {
              version = "8.0";
            } else if (RegExp.$1 == "5.0") {
              version = "9.0";
            }
          }
        } else if (isTrident) {
          // IE 11 dropped the "MSIE" string
          var match = /\brv\:(\d+?\.\d+?)\b/.exec(agent);
          if (match) {
            version = match[1];
          }
        }
      } else if (qx.bom.client.Engine.__isOpera()) {
        // Opera has a special versioning scheme, where the second part is combined
        // e.g. 8.54 which should be handled like 8.5.4 to be compatible to the
        // common versioning system used by other browsers
        if (/Opera[\s\/]([0-9]+)\.([0-9])([0-9]*)/.test(agent))
        {
          // opera >= 10 has as a first version 9.80 and adds the proper version
          // in a separate "Version/" postfix
          // http://my.opera.com/chooseopera/blog/2009/05/29/changes-in-operas-user-agent-string-format
          if (agent.indexOf("Version/") != -1) {
            var match = agent.match(/Version\/(\d+)\.(\d+)/);
            // ignore the first match, its the whole version string
            version =
              match[1] + "." +
              match[2].charAt(0) + "." +
              match[2].substring(1, match[2].length);
          } else {
            version = RegExp.$1 + "." + RegExp.$2;
            if (RegExp.$3 != "") {
              version += "." + RegExp.$3;
            }
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
      if (qx.bom.client.Engine.__isMshtml()) {
        name = "mshtml";
      } else if (qx.bom.client.Engine.__isOpera()) {
        name = "opera";
      } else if (qx.bom.client.Engine.__isWebkit()) {
        name = "webkit";
      } else if (qx.bom.client.Engine.__isGecko()) {
        name = "gecko";
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
     * Internal helper for checking for opera (presto powered).
     *
     * Note that with opera >= 15 their engine switched to blink, so
     * things like "window.opera" don't work anymore or changed (e.g. user agent).
     *
     * @return {Boolean} true, if its opera (presto powered).
     */
    __isOpera : function() {
      return window.opera &&
        Object.prototype.toString.call(window.opera) == "[object Opera]";
    },


    /**
     * Internal helper for checking for webkit.
     * @return {Boolean} true, if its webkit.
     */
    __isWebkit : function() {
      return window.navigator.userAgent.indexOf("AppleWebKit/") != -1;
    },


    /**
     * Internal helper for checking for gecko.
     *
     * Note:
     *  "window.controllers" is gone/hidden with Firefox 30+
     *  "window.navigator.mozApps" is supported since Firefox 11+ and is gone/hidden with Firefox 47 beta
     *  "window.navigator.buildID" is supported since Firefox 2+
     *  "window.navigator.product" is actually useless cause the HTML5 spec
     *    states it should be the constant "Gecko".
     *
     *  - https://developer.mozilla.org/en-US/docs/Web/API/Window.controllers
     *  - https://developer.mozilla.org/en-US/docs/Web/API/Navigator.mozApps
     *  - https://developer.mozilla.org/en-US/docs/Web/API/Navigator/buildID
     *  - http://www.w3.org/html/wg/drafts/html/master/webappapis.html#navigatorid
     *
     * @return {Boolean} true, if its gecko.
     */
    __isGecko : function() {
      return (window.navigator.mozApps || window.navigator.buildID) &&
        window.navigator.product === "Gecko" &&
        window.navigator.userAgent.indexOf("Trident") == -1;
    },


    /**
     * Internal helper to check for MSHTML.
     * @return {Boolean} true, if its MSHTML.
     */
    __isMshtml : function () {
      if (window.navigator.cpuClass &&
        (/MSIE\s+([^\);]+)(\)|;)/.test(window.navigator.userAgent) ||
          /Trident\/\d+?\.\d+?/.test(window.navigator.userAgent))) {
        return true;
      }
      if (qx.bom.client.Engine.__isWindowsPhone()) {
        return true;
      }
      return false;
    },



    /**
     * Internal helper to check for Windows phone.
     * @return {Boolean} true, if its Windows phone.
     */
    __isWindowsPhone: function () {
      return window.navigator.userAgent.indexOf("Windows Phone") > -1;
    }
  },

  defer : function(statics) {
    qx.core.Environment.add("engine.version", statics.getVersion);
    qx.core.Environment.add("engine.name", statics.getName);
  }
});
