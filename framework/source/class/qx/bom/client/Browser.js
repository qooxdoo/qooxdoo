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
     * Martin Wittemann (martinwittemann)

   ======================================================================

   This class contains code from:

     Copyright:
       2009 Deutsche Telekom AG, Germany, http://telekom.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Sebastian Werner (wpbasti)

   ======================================================================

   This class contains code from:

     Copyright:
       2011 Pocket Widget S.L., Spain, http://www.pocketwidget.com

     License:
       LGPL: http://www.gnu.org/licenses/lgpl.html
       EPL: http://www.eclipse.org/org/documents/epl-v10.php

     Authors:
       * Javier Martinez Villacampa


************************************************************************ */

/**
#require(qx.bom.client.OperatingSystem#getVersion)
*/

/**
 * Basic browser detection for qooxdoo.
 *
 * This class is used by {@link qx.core.Environment} and should not be used
 * directly. Please check its class comment for details how to use it.
 *
 * @internal
 */
qx.Bootstrap.define("qx.bom.client.Browser",
{
  statics :
  {
    /**
     * Checks for the name of the browser and returns it.
     * @return {String} The name of the current browser.
     * @internal
     */
    getName : function() {
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if (!match) {
        return "";
      }

      var name = match[1].toLowerCase();

      var engine = qx.bom.client.Engine.getName();
      if (engine === "webkit")
      {
        if (name === "android")
        {
          // Fix Chrome name (for instance wrongly defined in user agent on Android 1.6)
          name = "mobile chrome";
        }
        else if (agent.indexOf("Mobile Safari") !== -1 || agent.indexOf("Mobile/") !== -1)
        {
          // Fix Safari name
          name = "mobile safari";
        }
      }
      else if (engine ===  "mshtml")
      {
        if (name === "msie")
        {
          name = "ie";

          // Fix IE mobile before Microsoft added IEMobile string
          if (qx.bom.client.OperatingSystem.getVersion() === "ce") {
            name = "iemobile";
          }
        }
      }
      else if (engine === "opera")
      {
        if (name === "opera mobi") {
          name = "operamobile";
        } else if (name === "opera mini") {
          name = "operamini";
        }
      }
      else if (engine === "gecko")
      {
        if (agent.indexOf("Maple") !== -1) {
            name = "maple"
        }
      }

      return name;
    },


    /**
     * Determines the version of the current browser.
     * @return {String} The name of the current browser.
     * @internal
     */
    getVersion : function() {
      var agent = navigator.userAgent;
      var reg = new RegExp("(" + qx.bom.client.Browser.__agents + ")(/| )([0-9]+\.[0-9])");
      var match = agent.match(reg);
      if (!match) {
        return "";
      }

      var name = match[1].toLowerCase();
      var version = match[3];

      // Support new style version string used by Opera and Safari
      if (agent.match(/Version(\/| )([0-9]+\.[0-9])/)) {
        version = RegExp.$2;
      }

      if (qx.bom.client.Engine.getName() == "mshtml")
      {
        // Use the Engine version, because IE8 and higher change the user agent
        // string to an older version in compatibility mode
        version = qx.bom.client.Engine.getVersion();

        if (name === "msie" && qx.bom.client.OperatingSystem.getVersion() == "ce") {
          // Fix IE mobile before Microsoft added IEMobile string
          version = "5.0";
        }
      }

      if (qx.bom.client.Browser.getName() == "maple")
      {
        // Fix version detection for Samsung Smart TVs Maple browser from 2010 and 2011 models
        reg = new RegExp("(Maple )([0-9]+\.[0-9]+\.[0-9]*)");
        match = agent.match(reg);
        if (!match) {
          return "";
        }

        version = match[2];
      }

      return version;
    },


    /**
     * Returns in which document mode the current document is (only for IE).
     *
     * @internal
     * @return {Number} The mode in which the browser is.
     */
    getDocumentMode : function() {
      if (document.documentMode) {
        return document.documentMode;
      }
      return 0;
    },


    /**
     * Check if in quirks mode.
     *
     * @internal
     * @return {Boolean} <code>true</code>, if the environment is in quirks mode
     */
    getQuirksMode : function() {
      if(qx.bom.client.Engine.getName() == "mshtml" &&
        parseFloat(qx.bom.client.Engine.getVersion()) >= 8)
      {
        return qx.bom.client.Engine.DOCUMENT_MODE === 5;
      } else {
        return document.compatMode !== "CSS1Compat";
      }
    },


    /**
     * Internal helper map for picking the right browser names to check.
     */
    __agents : {
      // Safari should be the last one to check, because some other Webkit-based browsers
      // use this identifier together with their own one.
      // "Version" is used in Safari 4 to define the Safari version. After "Safari" they place the
      // Webkit version instead. Silly.
      // Palm Pre uses both Safari (contains Webkit version) and "Version" contains the "Pre" version. But
      // as "Version" is not Safari here, we better detect this as the Pre-Browser version. So place
      // "Pre" in front of both "Version" and "Safari".
      "webkit" : "AdobeAIR|Titanium|Fluid|Chrome|Android|Epiphany|Konqueror|iCab|OmniWeb|Maxthon|Pre|Mobile Safari|Safari",

      // Better security by keeping Firefox the last one to match
      "gecko" : "prism|Fennec|Camino|Kmeleon|Galeon|Netscape|SeaMonkey|Namoroka|Firefox",

      // No idea what other browsers based on IE's engine
      "mshtml" : "IEMobile|Maxthon|MSIE",

      // Keep "Opera" the last one to correctly prefer/match the mobile clients
      "opera" : "Opera Mini|Opera Mobi|Opera"
    }[qx.bom.client.Engine.getName()]
  },

  defer : function(statics) {
    qx.core.Environment.add("browser.name", statics.getName),
    qx.core.Environment.add("browser.version", statics.getVersion),
    qx.core.Environment.add("browser.documentmode", statics.getDocumentMode),
    qx.core.Environment.add("browser.quirksmode", statics.getQuirksMode)
  }
});
