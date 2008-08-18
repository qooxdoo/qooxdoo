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

qx.Class.define("demobrowser.demo.widget.Label",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var label1 = new qx.ui.basic.Label("My Label").set({
        decorator: "main"
      });
      this.getRoot().add(label1, {left:20, top:20});

      var label2 = new qx.ui.basic.Label("My First Long Label").set({
        decorator: "main"
      });
      this.getRoot().add(label2, {left:20, top:60});

      var label3 = new qx.ui.basic.Label("My First Long Label Cutted").set({
        decorator: "main",
        width: 80
      });
      this.getRoot().add(label3, {left:20, top:100});

      var label4 = new qx.ui.basic.Label().set({
        content: "A long label text with auto-wrapping. This also may contain <b style='color:red'>rich HTML</b> markup.",
        decorator: "main",
        rich : true,
        width: 120
      });
      this.getRoot().add(label4, {left:20, top:140});

      var label5 = new qx.ui.basic.Label("Big Long Label").set({
        decorator: "main",
        font : new qx.bom.Font(28, ["Verdana", "sans-serif"])
      });
      this.getRoot().add(label5, {left:20, top:220});

      var label6 = new qx.ui.basic.Label("Big Long Label Cutted").set({
        decorator: "main",
        font : new qx.bom.Font(28, ["Verdana", "sans-serif"]),
        width : 150
      });
      this.getRoot().add(label6, {left:20, top:280});
    }
  }
});
