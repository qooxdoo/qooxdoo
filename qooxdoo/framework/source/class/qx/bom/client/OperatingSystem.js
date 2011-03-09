/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * This class is responsible for checking the operating systems name.
 */
qx.Bootstrap.define("qx.bom.client.OperatingSystem", 
{
  statics :
  {
    /**
     * Checks for the name of the operating system.
     * @return {String} The name of the operating system.
     * @internal
     */
    getName : function() {
      var input = navigator.platform;

      if (
        input.indexOf("Windows") != -1 || 
        input.indexOf("Win32") != -1 || 
        input.indexOf("Win64") != -1
      ) {
        return "win";

      } else if (
        input.indexOf("Macintosh") != -1 || 
        input.indexOf("MacPPC") != -1 || 
        input.indexOf("MacIntel") != -1
      ) {
        return "mac";

      } else if (
        input.indexOf("iPod") != -1 || 
        input.indexOf("iPhone") != -1 || 
        input.indexOf("iPad") != -1
      ) {
        return "ios";
        
      } else if (
        input.indexOf("X11") != -1 || 
        input.indexOf("Linux") != -1 || 
        input.indexOf("BSD") != -1
      ) {
        return "unix";
      }

      // don't know
      return "";
    }
  }
});