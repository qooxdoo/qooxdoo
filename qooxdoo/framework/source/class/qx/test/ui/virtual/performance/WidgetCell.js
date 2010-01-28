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

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.performance.WidgetCell",
{
  extend : qx.test.ui.virtual.performance.AbstractLayerTest,
  type : "abstract", // disabled

  construct : function()
  {
    this.base(arguments);

    this._pool = [];
  },


  members :
  {
    ITERATIONS : 3,

    getLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },

    getCellWidget : function(row, column)
    {
      var widget = this._pool.pop() || new qx.ui.basic.Label();
      widget.setContent(row + " / " + column);
      return widget;
    },

    poolCellWidget : function(widget) {
      this._pool.push(widget);
    }
  }
});
