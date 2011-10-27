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

qx.Class.define("qx.test.ui.decoration.Double",
{
  extend : qx.test.ui.LayoutTestCase,

  members:
  {
    testResize : function()
    {
      var dc = new qx.ui.decoration.Double();
      dc.set({
        backgroundImage : "none",
        width: 1,
        color: "red",
        innerWidth: 3,
        innerColor : "blue"
      });

      var w = new qx.ui.core.Widget();
      this.getRoot().add(w);
      w.set({
        decorator : dc
      });

      this.flush();

      dc.dispose();
      w.destroy();
    }
  }
});
