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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Request",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var el = document.getElementById("content");
      el.value = "Loading...";

      var req = new qx.bom.Request;
      req.open("GET", "Request_1.html", true);

      req.onreadystatechange = function()
      {
        qx.log.Logger.debug("Event: readystatechange: " + req.readyState);
        if (req.readyState == 4) {
          el.value = req.responseText;
        }
      }

      req.onload = function() {
        qx.log.Logger.debug("Event: load");
      }

      req.onerror = function() {
        qx.log.Logger.debug("Event: error");
      }

      req.ontimeout = function() {
        qx.log.Logger.debug("Event: timeout");
      }

      req.onabort = function() {
        qx.log.Logger.debug("Event: abort");
      }

      req.send("");
    }
  }
});
