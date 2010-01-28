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

************************************************************************ */

/**
 * This class comes with all relevant information regarding
 * the client's engine.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 */
qx.Bootstrap.define("qx.bom.client.Engine",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  // General: http://en.wikipedia.org/wiki/Browser_timeline
  // Webkit: http://developer.apple.com/internet/safari/uamatrix.html
  // Firefox: http://en.wikipedia.org/wiki/History_of_Mozilla_Firefox
  statics :
  {
    /** {String} Name of the client's HTML/JS engine e.g. mshtml, gecko, webkit, opera, khtml */
    NAME : "",

    /** {String} Full version string with multiple dots (major.minor.revision) e.g. 1.8.1, 8.5.4 */
    FULLVERSION : "0.0.0",

    /** {Float} Version of the client's HTML/JS engine e.g. 1.0, 1.7, 1.9 */
    VERSION : 0.0,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine */
    OPERA : false,

    /** {Boolean} Flag to detect if the client is based on the Webkit HTML/JS engine */
    WEBKIT : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine */
    GECKO : false,

    /** {Boolean} Flag to detect if the client is based on the Internet Explorer HTML/JS engine */
    MSHTML : false,

    /** {Boolean} Flag to detect if the client engine is assumed */
    UNKNOWN_ENGINE : false,

    /** {Boolean} Flag to detect if the client engine version is assumed */
    UNKNOWN_VERSION: false,

    /**
     * {Integer|null} Flag to detect the document mode from the Internet Explorer 8
     *
     * <code>null</code> The document mode is not supported.
     * <code>5</code> Microsoft Internet Explorer 5 mode (also known as "quirks mode").
     * <code>7</code> Internet Explorer 7 Standards mode.
     * <code>8</code> Internet Explorer 8 Standards mode.
     */
    DOCUMENT_MODE : null,


    /**
     * Internal initialize helper
     *
     * @lint ignoreDeprecated(alert)
     * @return {void}
     */
    __init : function()
    {
      var engine = "unknown";
      var version = "0.0.0";
      var agent = window.navigator.userAgent;
      var unknownEngine = false;
      var unknownVersion = false;

      if (window.opera &&
          Object.prototype.toString.call(window.opera) == "[object Opera]")
      {
        engine = "opera";
        this.OPERA = true;

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
        else
        {
          unknownVersion = true;
          version = "9.6.0";
        }
      }
      else if (window.navigator.userAgent.indexOf("AppleWebKit/") != -1)
      {
        engine = "webkit";
        this.WEBKIT = true;

        if (/AppleWebKit\/([^ ]+)/.test(agent))
        {
          version = RegExp.$1;

          // We need to filter these invalid characters
          var invalidCharacter = RegExp("[^\\.0-9]").exec(version);

          if (invalidCharacter) {
            version = version.slice(0, invalidCharacter.index);
          }
        }
        else
        {
          unknownVersion = true;
          version = "525.26";
        }
      }
      else if (window.controllers && window.navigator.product === "Gecko")
      {
        engine = "gecko";
        this.GECKO = true;

        // Parse "rv" section in user agent string
        if (/rv\:([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;
        } else {
          unknownVersion = true;
          version = "1.9.0.0";
        }
      }
      else if (window.navigator.cpuClass && /MSIE\s+([^\);]+)(\)|;)/.test(agent))
      {
        engine = "mshtml";
        version = RegExp.$1;

        if (document.documentMode) {
          this.DOCUMENT_MODE = document.documentMode;
        }

        // If the IE8 is running in the compatibility mode, the MSIE value
        // is set to IE7, but we need the correct verion. The only way is to
        // compare the trident version.
        if (version < 8 && /Trident\/([^\);]+)(\)|;)/.test(agent)) {
          if (RegExp.$1 === "4.0") {
            version = "8.0";
          }
        }

        this.MSHTML = true;
      }
      else
      {
        var failFunction = window.qxFail;

        if (failFunction && typeof failFunction === "function") {
          var engine = failFunction();

          if (engine.NAME && engine.FULLVERSION)
          {
            engine = engine.NAME;
            this[engine.toUpperCase()] = true;
            version = engine.FULLVERSION;
          }
        }
        else {
          unknownEngine = true;
          unknownVersion = true;
          version = "1.9.0.0";
          engine = "gecko";
          this.GECKO = true;

          window.alert("Unsupported client: " + agent
            + "! Assumed gecko version 1.9.0.0 (Firefox 3.0).");
        }
      }

      this.UNKNOWN_ENGINE = unknownEngine;
      this.UNKNOWN_VERSION = unknownVersion;
      this.NAME = engine;
      this.FULLVERSION = version;
      this.VERSION = parseFloat(version);
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    statics.__init();
  }
});
