/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
/**
 * @tag noPlayground
 */
qx.Class.define("demobrowser.demo.bom.PageVisibility",
{
  extend : qx.application.Native,

  members :
  {
    main : function()
    {
      this.base(arguments);

      var page = new qx.bom.PageVisibility();
      var log = this.log;

      page.on("change", function() {
        log("----------- visibility change event -----------");
      });

      // poll for the states
      setInterval(function() {
        var hidden = page.isHidden();
        log(
          +(new Date()) + " --- " +
          "hidden: <span style='color:" + (hidden ? "red" : "green") + ";'>" + hidden + "</span> | " +
          "state:" + page.getVisibilityState());
      }, 1000);

    },

    log : function(txt) {
      var log = document.getElementById("log");
      log.innerHTML = txt + "<br>" + document.getElementById("log").innerHTML;
    }
  }
});
