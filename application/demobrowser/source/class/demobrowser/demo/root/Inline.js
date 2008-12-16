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

qx.Class.define("demobrowser.demo.root.Inline",
{
  extend : qx.application.Inline,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var isle = new qx.ui.root.Inline(document.getElementById("isle")).set({
        decorator: "main",
        padding: 10,
        textColor: "black",
        backgroundColor: "white"
      });

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: "main",
        padding: 10
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: "main"
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: "main"
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: "main"
      });

      isle.add(w1);
      isle.add(w2);
      isle.add(w3);
      isle.add(w4);

      isle.setLayout(new qx.ui.layout.HBox());
    }
  }
});
