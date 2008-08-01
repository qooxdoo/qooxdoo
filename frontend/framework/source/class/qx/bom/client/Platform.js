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
 * the client's platform.
 *
 * The listed constants are automatically filled on the initialization
 * phase of the class. The defaults listed in the API viewer need not
 * to be identical to the values at runtime.
 */
qx.Bootstrap.define("qx.bom.client.Platform",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {String} The name of the platform. One of: "win", "mac", "unix" */
    NAME : "",

    /** {Boolean} Flag to detect if the client system is running Windows */
    WIN : false,

    /** {Boolean} Flag to detect if the client system is running Mac OS */
    MAC : false,

    /** {Boolean} Flag to detect if the client system is running Unix/Linux/BSD */
    UNIX : false,


    /**
     * Internal initialize helper
     *
     * @return {void}
     * @throws TODOC
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
      else if (input.indexOf("Macintosh") != -1 || input.indexOf("MacPPC") != -1 || input.indexOf("MacIntel") != -1 || input.indexOf("iPod") != -1 || input.indexOf("iPhone") != -1)
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
        throw new Error("Unable to detect platform: " + input);
      }
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
