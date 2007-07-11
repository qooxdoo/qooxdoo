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

************************************************************************ */

/* ************************************************************************

#module(client)

************************************************************************ */

qx.Class.define("qx.html2.client.Engine",
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

    /** {Float} Version of the client's HTML/JS engine e.g. 1.0, 1.7, 1.9 */
    VERSION : 0.0,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine */
    OPERA : false,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine of Opera 8 (April 2005) */
    OPERA8 : false,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine of Opera 8.5 (September 2005) */
    OPERA85 : false,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine of Opera 9 (June 2006) */
    OPERA9 : false,

    /** {Boolean} Flag to detect if the client is based on the Opera HTML/JS engine of Opera 9.5 (~November 2007) */
    OPERA95 : false,

    /** {Boolean} Flag to detect if the client is based on the KHTML HTML/JS engine */
    KHTML : false,

    /** {Boolean} Flag to detect if the client is based on the Webkit HTML/JS engine */
    WEBKIT : false,

    /** {Boolean} Flag to detect if the client is based on the Webkit HTML/JS engine of Safari 2 (April 2005) */
    WEBKIT419 : false,

    /** {Boolean} Flag to detect if the client is based on the Webkit HTML/JS engine of Safari 3 (~November 2007) */
    WEBKIT420 : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine */
    GECKO : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine of Firefox 1.0 (November 2004) */
    GECKO17 : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine of Firefox 1.5 (November 2005) */
    GECKO18 : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine of Firefox 2.0 (October 2006) */
    GECKO181 : false,

    /** {Boolean} Flag to detect if the client is based on the Gecko HTML/JS engine of Firefox 3.0 (~November 2007) */
    GECKO19 : false,

    /** {Boolean} Flag to detect if the client is based on the Internet Explorer HTML/JS engine */
    MSHTML : false,

    /** {Boolean} Flag to detect if the client is based on the Internet Explorer HTML/JS engine of IE 6 (October 2001) */
    MSHTML6 : false,

    /** {Boolean} Flag to detect if the client is based on the Internet Explorer HTML/JS engine of IE 7 (October 2006) */
    MSHTML7 : false,


    /**
     * Internal initialize helper
     */
    __init : function()
    {
      var engine = "unknown";
      var version = "0.0";
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
      else if (navigator.vendor === "KDE")
      {
        engine = "khtml";
        this.KHTML = true;

        if (/KHTML\/([0-9-\.]*)/.test(agent)) {
          version = RegExp.$1;
        } else {
          throw new Error("Could not detect KHTML version: " + agent + "!");
        }
      }
      else if (agent.indexOf("AppleWebKit") != -1)
      {
        engine = "webkit";
        this.WEBKIT = true;

        if (/AppleWebKit\/([^ ]+)/.test(agent))
        {
          version = RegExp.$1;

          // Webkit adds a plus sign in nightly builds
          var nightly = version.indexOf("+") != -1;

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
      else if (/MSIE\s+([^\);]+)(\)|;)/.test(agent))
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

      if (this.MSHTML)
      {
        if (this.VERSION < 6) {
          this.MSHTML5 = true;
        } else if (this.VERSION < 7) {
          this.MSHTML6 = true;
        } else {
          this.MSHTML7 = true;
        }
      }
      else if (this.WEBKIT)
      {
        if (this.VERSION < 420) {
          this.WEBKIT419 = true;
        } else {
          this.WEBKIT420 = true;
        }
      }
      else if (this.GECKO)
      {
        if (this.VERSION < 1.8) {
          this.GECKO17 = true;
        } else if (this.FULLVERSION === "1.8") {
          this.GECKO18 = true;
        } else if (this.VERSION < 1.9) {
          this.GECKO181 = true;
        } else {
          this.GECKO19 = true;
        }
      }
      else if (this.OPERA)
      {
        if (this.VERSION < 8.5) {
          this.OPERA8 = true;
        } else if (this.VERSION < 9) {
          this.OPERA85 = true;
        } else if (this.VERSION < 9.5) {
          this.OPERA9 = true;
        } else if (this.VERSION < 10) {
          this.OPERA95 = true;
        }
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics){
    statics.__init();
  }
});
