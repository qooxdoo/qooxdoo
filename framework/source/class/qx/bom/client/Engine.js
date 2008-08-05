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
 * This class comes with all relevant informations regarding
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


    /**
     * Internal initialize helper
     *
     * @return {void}
     * @throws TODOC
     */
    __init : function()
    {
      var engine = "unknown";
      var version = "0.0.0";
      var agent = navigator.userAgent;

      if (window.opera)
      {
        engine = "opera";
        this.OPERA = true;

        // Opera has a special versioning scheme, where the second part is combined
        // e.g. 8.54 which should be handled like 8.5.4 to be compatible to the
        // common versioning system used by other browsers
        if (/Opera[\s\/]([0-9\.]*)/.test(agent)) {
          version = RegExp.$1.substring(0, 3) + "." + RegExp.$1.substring(3);
        } else {
          throw new Error("Could not detect Opera version: " + agent + "!");
        }
      }
      else if (navigator.vendor && (navigator.vendor === "Apple Computer, Inc." || navigator.vendor === "Adobe Systems Incorporated"))
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
          throw new Error("Could not detect Webkit version: " + agent + "!");
        }
      }
      else if (window.controllers && navigator.product === "Gecko")
      {
        engine = "gecko";
        this.GECKO = true;

        // Parse "rv" section in user agent string
        if (/rv\:([^\);]+)(\)|;)/.test(agent)) {
          version = RegExp.$1;
        } else {
          throw new Error("Could not detect Gecko version: " + agent + "!");
        }
      }
      else if (navigator.cpuClass && /MSIE\s+([^\);]+)(\)|;)/.test(agent))
      {
        engine = "mshtml";
        version = RegExp.$1;

        this.MSHTML = true;
      }
      else
      {
        throw new Error("Unsupported client: " + agent + "!");
      }

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
