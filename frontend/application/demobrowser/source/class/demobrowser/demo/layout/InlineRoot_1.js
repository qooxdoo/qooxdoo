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

qx.Class.define("demobrowser.demo.layout.InlineRoot_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

var border = new qx.ui.decoration.Basic(1, "solid", "black");

      var isle = new qx.ui.root.Inline(document.getElementById("isle")).set({
        decorator: border,
        padding: 10,
        textColor: "black",
        backgroundColor: "white"
      });
      //isle.getElement().setStyle("font", "11px Tahoma, sans-serif");


      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border,
        padding: 10
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: border
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border
      });

      var layout = new qx.ui.layout.HBox();

      layout.add(w1);
      layout.add(w2);
      layout.add(w3);
      layout.add(w4);

      isle.setLayout(layout);
    }
  }
});
