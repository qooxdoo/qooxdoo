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

qx.Class.define("demobrowser.demo.test.io_HttpRequest",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var el = document.getElementById("content");
      el.value = "Loading...";

      var req = new qx.io.HttpRequest;

      req.setUrl("io_HttpRequest.html");

      req.addListener("change", function(e)
      {
        var state = e.getData();
        qx.log.Logger.debug("Event: readystatechange: " + state);
        if (state == 4) {
          el.value = this.getResponseText();
        }
      });

      req.addListener("load", function() {
        qx.log.Logger.debug("Event: load");
      });

      req.addListener("error", function() {
        qx.log.Logger.debug("Event: error");
      });

      req.addListener("timeout", function() {
        qx.log.Logger.debug("Event: timeout");
      });

      req.addListener("abort", function() {
        qx.log.Logger.debug("Event: abort");
      });

      req.send();
    }
  }
});
