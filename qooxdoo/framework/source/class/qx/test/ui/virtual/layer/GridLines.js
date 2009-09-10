/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.GridLines",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    _assertGridLines : function(linesLayer, isHorizontal, color, lineSize, msg)
    {
      this.assertEquals(isHorizontal, linesLayer.isHorizontal(), msg);
      this.assertEquals(color, linesLayer.getDefaultLineColor(), msg);
      this.assertEquals(lineSize, linesLayer.getDefaultLineSize(), msg);
    },

    testCreate : function()
    {
      var lines = new qx.ui.virtual.layer.GridLines();
      this._assertGridLines(lines, true, "gray", 1);
      lines.destroy();

      var lines = new qx.ui.virtual.layer.GridLines("horizontal");
      this._assertGridLines(lines, true, "gray", 1);
      lines.destroy();

      var lines = new qx.ui.virtual.layer.GridLines("vertical", "red");
      this._assertGridLines(lines, false, "red", 1);
      lines.destroy();

      var lines = new qx.ui.virtual.layer.GridLines("vertical", "red", 5);
      this._assertGridLines(lines, false, "red", 5);
      lines.destroy();
    }
  }
});
