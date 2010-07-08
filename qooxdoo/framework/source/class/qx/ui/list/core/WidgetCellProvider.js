/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL!
 */
qx.Class.define("qx.ui.list.core.WidgetCellProvider",
{
  extend : qx.core.Object,
  implement : qx.ui.virtual.core.IWidgetCellProvider,

  construct : function(list)
  {
    this.base(arguments);

    this._cellRenderer = new qx.ui.virtual.cell.ListItemWidgetCell();
    this._list = list;
  },

  members :
  {
    _cellRenderer : null,

    getCellWidget : function(row, column)
    {
      var modelData = this._list._getDataFromRow(row);
      var widgetData = {};
      
      widgetData.label = this._list._delegate.getLabel(modelData);
      widgetData.icon = this._list._delegate.getIcon(modelData);

      var widget = this._cellRenderer.getCellWidget(widgetData);

      if(this._list._manager.isItemSelected(row)) {
        this.styleSelectabled(widget);
      }

      return widget;
    },

    poolCellWidget : function(widget) {
      this._cellRenderer.pool(widget);
    },

    styleSelectabled : function(item) {
      this._cellRenderer.updateStates(item, {selected: 1});
    },

    styleUnselectabled : function(item) {
      this._cellRenderer.updateStates(item, {});
    }
  },

  destruct : function()
  {
    this._cellRenderer.dispose();
    this._cellRenderer = null;
  }
});
