/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

   ======================================================================

   This class contains code from:

     Copyright:
       2009 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Basic browser detection for qooxdoo. Based on "qx.client" variant for
 * optimal performance and less overhead.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 */
qx.Bootstrap.define("qx.bom.client.Browser",
{
  statics :
  {
    /** {Boolean} Whether the browser could not be determined */
    UNKNOWN : true,

    /** {String} Name of the browser */
    NAME : "unknown",

    /** {String} Combination of name and version e.g. "firefox 3.5" */
    TITLE : "unknown 0.0",

    /** {Number} Floating point number of browser version */
    VERSION : 0.0,

    /** {String} Full version. Might contain two dots e.g. "3.5.1" */
    FULLVERSION : "0.0.0",

    /**
     * Processes the incoming list of agents to find out
     * which of them matches.
     *
     * @param agents {String} One list of agents, separated by a pipe "|"
     */
    __detect : function(agents)
    {
      var current = navigator.userAgent;
      var reg = new RegExp("(" + agents + ")(/| )([0-9]+\.[0-9])");
      var match = current.match(reg);
      if (!match) {
        return;
      }

      var name = match[1].toLowerCase();
      var version = match[3];

      // Support new style version string used by Opera and Safari
      if (current.match(/Version(\/| )([0-9]+\.[0-9])/)) {
        version = RegExp.$2;
      }

      if (qx.core.Variant.isSet("qx.client", "webkit"))
      {
        // Fix Chrome name (which is still wrong defined in user agent on Android 1.6)
        if (name === "android") {
          name = "mobile chrome";
        }

        // Fix Safari name
        else if (current.indexOf("Mobile Safari") !== -1 || current.indexOf("Mobile/") !== -1) {
          name = "mobile safari";
        }
      }
      else if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (name === "msie")
        {
          name = "ie";

          // Fix IE mobile before Microsoft added IEMobile string
          if (qx.bom.client.System.WINCE && name === "ie")
          {
            name = "iemobile";
            version = "5.0";
          }
        }
      }
      else if (qx.core.Variant.isSet("qx.client", "opera"))
      {
        if (name === "opera mobi") {
          name = "operamobile";
        } else if (name === "opera mini") {
          name = "operamini";
        }
      }

      this.NAME = name;
      this.FULLVERSION = version;
      this.VERSION = parseFloat(version, 10);
      this.TITLE = name + " " + this.VERSION;
      this.UNKNOWN = false;
    }
  },

  defer : qx.core.Variant.select("qx.client",
  {
    "webkit" : function(statics)
    {
      // Safari should be the last one to check, because some other Webkit-based browsers
      // use this identifier together with their own one.
      // "Version" is used in Safari 4 to define the Safari version. After "Safari" they place the
      // Webkit version instead. Silly.
      // Palm Pre uses both Safari (contains Webkit version) and "Version" contains the "Pre" version. But
      // as "Version" is not Safari here, we better detect this as the Pre-Browser version. So place
      // "Pre" in front of both "Version" and "Safari".
      statics.__detect("AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari");
    },

    "gecko" : function(statics)
    {
      // Better security by keeping Firefox the last one to match
      statics.__detect("prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Firefox");
    },

    "mshtml" : function(statics)
    {
      // No idea what other browsers based on IE's engine
      statics.__detect("IEMobile|Maxthon|MSIE");
    },

    "opera" : function(statics)
    {
      // Keep "Opera" the last one to correctly prefer/match the mobile clients
      statics.__detect("Opera Mini|Opera Mobi|Opera");
    }
  })
});
