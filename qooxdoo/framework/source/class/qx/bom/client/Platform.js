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
 * the client's platform.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 *
 * @deprecated since 1.4: Please use qx.core.Environment instead.
 */
qx.Class.define("qx.bom.client.Platform",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * {String} The name of the platform. One of: "win", "mac", "unix"
     * @deprecated since 1.4: See qx.core.Environment
     */
    NAME : "",

    /**
     * {Boolean} Flag to detect if the client system is running Windows
     * @deprecated since 1.4: See qx.core.Environment
     */
    WIN : false,

    /**
     * {Boolean} Flag to detect if the client system is running Mac OS
     * @deprecated since 1.4: See qx.core.Environment
     */
    MAC : false,

    /**
     * {Boolean} Flag to detect if the client system is running Unix/Linux/BSD
     * @deprecated since 1.4: See qx.core.Environment
     */
    UNIX : false,

    /**
     * {Boolean} Flag to detect if the client system is assumed
     * @deprecated since 1.4: See qx.core.Environment
     */
    UNKNOWN_PLATFORM : false,

    /**
     * Internal initialize helper
     *
     * @return {void}
     */
    __init : function()
    {
      var input = navigator.platform;

      // Fallback to user agent
      // Needed for Adobe AIR 1.0
      if (input == null || input === "") {
        input = navigator.userAgent;
      }

      if (input.indexOf("Windows") != -1 || input.indexOf("Win32") != -1 || input.indexOf("Win64") != -1)
      {
        this.WIN = true;
        this.NAME = "win";
      }
      else if (input.indexOf("Macintosh") != -1 || input.indexOf("MacPPC") != -1 || input.indexOf("MacIntel") != -1 || input.indexOf("iPod") != -1 || input.indexOf("iPhone") != -1 || input.indexOf("iPad") != -1)
      {
        this.MAC = true;
        this.NAME = "mac";
      }
      else if (input.indexOf("X11") != -1 || input.indexOf("Linux") != -1 || input.indexOf("BSD") != -1)
      {
        this.UNIX = true;
        this.NAME = "unix";
      }
      else
      {
        this.UNKNOWN_PLATFORM = true;
        this.WIN = true;
        this.NAME = "win";
      }
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
    statics.__init();

    // only when debug is on (@deprecated)
    if (qx.Bootstrap.DEBUG) {
      // add @deprecation warnings
      var keys = ["NAME", "WIN", "MAC", "UNIX", "UNKNOWN_PLATFORM"];
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
