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
/* ************************************************************************
#require(qx.module.Placeholder)
************************************************************************ */

qx.Class.define("demobrowser.demo.bom.Placeholder",
{
  extend : qx.application.Native,

  members :
  {
    main: function()
    {
      this.base(arguments);
      // set the support label
      q("#support").setHtml(q.env.get("css.placeholder"));

      // add new textfields button
      q("input[type=button]").setAttribute("disabled", null).on("click", this.addTextField);

      q.placeholder.update();
    },


    addTextField : function() {
      var now = Date.now();
      var input = q.create("<input type='text' placeholder='" + now + "'/><br>")
        .appendTo(document.body);

      // set random styles
      input.setStyles({
        width: ((now % 100) + 50) + "px",
        padding : (now % 20) + "px",
        fontSize: ((now % 30) + 10) + "px",
        fontWeight : now % 2 ? "bold" : "normal",
        fontStyle : now % 2 ? "italic" : "normal",
        fontFamily : ["monospace", "serif", "sans-serif", "cursive"][now % 4]
      }).updatePlaceholder();
    }
  }
});
