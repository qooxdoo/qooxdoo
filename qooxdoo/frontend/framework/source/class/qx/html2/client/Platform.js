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

qx.Class.define("qx.html2.client.Platform",
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
     */
    __init : function()
    {
      var input = navigator.platform;

      if (input.indexOf("Windows") != -1 || input.indexOf("Win32") != -1 || input.indexOf("Win64") != -1)
      {
        this.WIN = true;
        this.NAME = "win";
      }
      else if (input.indexOf("Macintosh") != -1 || input.indexOf("MacPPC") != -1 || input.indexOf("MacIntel") != -1)
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
