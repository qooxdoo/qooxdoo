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
 * Version detection for browser engines (not browser versions).
 *
 * The <code>NAME</code> might differ from the result of {@link qx.bom.client.Engine#NAME}
 * as this detection is based on the user agent string and not on the behavior. This also
 * means that the version numbers may not be accurate as soon as the user changes the agent string.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 *
 * This class uses a custom, more intuitive, version scheme than the
 * default engine versions. These are most often not that published by
 * the vendors and even when they might only differ minor and make comparisons
 * quite complex and erroneous.
 *
 * * MSIE 6 (Trident ?) => 2
 * * MSIE 7 (Trident ?) => 3
 * * MSIE 8 (Trident 4) => 4
 *
 * * Firefox < 1.0 (Gecko 1.6) => 0
 * * Firefox 1.0 (Gecko 1.7) => 1
 * * Firefox 1.5 (Gecko 1.8) => 2
 * * Firefox 2 (Gecko 1.8.1) => 3
 * * Firefox 3 (Gecko 1.9) => 4
 * * Firefox 3.5 (Gecko 1.9.1) => 5
 * * Firefox 3.6 (Gecko 1.9.2) => 6
 *
 * * Opera 9 (Presto 2) => 1
 * * Opera 9.5 / Mobile 9.5 (Presto 2.1) => 2
 * * Opera 9.6 (Presto 2.1.1) => 2
 * * Opera Mobile 9.7 (Presto 2.2) => 3
 * * Opera 10 (Presto 2.2.15) => 3
 * * Opera Mobile 10 (Presto 2.4) => 4
 *
 * * Safari 3 (Webkit 522) => 2
 * * Safari 3.1 (Webkit 525) => 3
 * * Safari 4 (Webkit 526-530+) => 4
 * * Chrome 1 (Webkit 528) => 4
 * * Chrome 2 (Webkit 530+) => 4
 * * Chrome 3 (Webkit 532) => 4
 * * Android 1.5 (Webkit 528) => 4
 * * Android 2.0 (Webkit xxx) => 5
 * * Chrome 4 (Webkit xxx) => 5
 *
 * @deprecated since 1.4: Please use qx.core.Environment instead.
 */
qx.Bootstrap.define("qx.bom.client.Version",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {String} The name of the engine. One of <code>trident</code>, <code>gecko</code>, <code>webkit</code> or <code>presto</code>. */
    NAME : "unknown",

    /** {String} Title of the engine (combines name and version) */
    TITLE : "unknown 0.0",

    /** {Number} Engine version following map in class documentation */
    VERSION : 0.0
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */
  /**
   * @lint ignoreUndefined(qxvariants)
   */
  defer : function(statics)
  {
    var agent = navigator.userAgent;
    var name, version;

    // Opera, Opera Mobile and Opera Mini (new versions)
    if (/Presto[\s\/]([0-9]+\.[0-9\.]+)/.test(agent))
    {
      name = "presto";
      version = parseFloat(RegExp.$1);

      if (version >= 2.4) {
        version = 4;
      } else if (version >= 2.2) {
        version = 3;
      } else if (version >= 2.1) {
        version = 2;
      } else {
        version = 1;
      }
    }

    // Operas (older versions - without Presto info)
    else if (/Opera[\s\/]([0-9]+)\.([0-9])/.test(agent))
    {
      name = "presto";
      version = parseFloat(RegExp.$1 + "." + RegExp.$2);

      if (version >= 9.7) {
        version = 3;
      } else if (version >= 9.5) {
        version = 2;
      } else {
        version = 1;
      }
    }

    // Safari, Chrome, Android, Epiphany, ...
    else if (/AppleWebKit\/([^ ]+)/.test(agent))
    {
      name = "webkit";
      version = RegExp.$1;

      // We need to filter these invalid characters
      var invalidCharacter = RegExp("[^\\.0-9]").exec(version);
      if (invalidCharacter) {
        version = version.slice(0, invalidCharacter.index);
      }

      // Parse and convert version number
      version = parseFloat(version);
      if (version >= 526) {
        version = 4;
      } else if (version >= 525) {
        version = 3;
      } else if (version >= 522) {
        version = 2;
      } else {
        version = 1;
      }
    }

    // Firefox, SeaMonkey, Netscape, etc.
    // Parse "rv" section in user agent string of gecko
    else if (/rv\:([^\);]+)(\)|;)/.test(agent))
    {
      name = "gecko";
      version = RegExp.$1;

      if (version >= "1.9.2") {
        version = 6;
      } else if (version >= "1.9.1") {
        version = 5;
      } else if (version >= "1.9") {
        version = 4;
      } else if (version >= "1.8.1") {
        version = 3;
      } else if (version >= "1.8") {
        version = 2;
      } else if (version >= "1.7") {
        version = 1;
      } else {
        version = 0;
      }
    }

    // Internet Explorer etc.
    else if (/MSIE\s+([^\);]+)(\)|;)/.test(agent))
    {
      name = "trident";
      version = parseInt(RegExp.$1, 10);

      // No trident parsing here:
      // Strategy is to trust the MSIE version as Microsoft tries
      // to emulate the version (or even runs the engine in parallel
      // which is given at MSIE). There might be minor differences
      // in the same area as same engines on different platforms or
      // systems or even embedded into different browsers.
      // This should be handled somewhere else because of the complexity

      // Map IE version to Trident version
      // 8 => 4
      // 7 => 3
      // 6 => 2
      version = Math.max(version-4, 0);
    }

    else
    {
      // Oops
      return;
    }

    // Store data
    statics.NAME = name;
    statics.VERSION = version;
    statics.TITLE = name + " " + version;

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // @deprecated since 1.4 (whole class)
      // add @deprecation warnings
      var keys = ["NAME", "TITLE", "VERSION"];
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
