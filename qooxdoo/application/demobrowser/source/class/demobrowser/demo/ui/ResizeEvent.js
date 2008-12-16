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

qx.Class.define("demobrowser.demo.ui.ResizeEvent",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var red = new qx.ui.core.Widget().set({backgroundColor: "red", width: 80});
      var blue = new qx.ui.core.Widget().set({backgroundColor: "blue"});

      this.getRoot().add(red, {left: 10, top: 10});
      this.getRoot().add(blue, {left: 10, top: 110});

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
