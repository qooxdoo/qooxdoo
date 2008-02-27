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

qx.Class.define("demobrowser.demo.layout.ResizeEvent_1",
{
  extend : demobrowser.Demo,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);
      doc.setTextColor("black");
      doc.setBackgroundColor("white");

      var red = (new qx.ui.core.Widget).set({backgroundColor: "red", width: 80});
      var blue = (new qx.ui.core.Widget).set({backgroundColor: "blue"});

      doc.add(red, 10, 10);
      doc.add(blue, 10, 110);

      red.addListener("resize", function(e) {
        this.debug("Resize red");
        blue.setWidth(e.getData().width);
      });

      red.addListener("click", function() {
        red.setWidth(red.getWidth() + 10);
      });
    }
  }
});
