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
  include : [qx.ui.list.core.MWidgetCellController],

  construct : function(list)
  {
    this.base(arguments);

    this._cellRenderer = this._createCellRenderer();
    this._list = list;
    
    this._cellRenderer.addListener("created", this._onWidgetCreated, this);
    this._list.addListener("changeDelegate", this._onChangeDelegate, this);
  },

  members :
  {
    _cellRenderer : null,

    getCellWidget : function(row, column)
    {
      var modelData = this._list._getDataFromRow(row);
      var widget = this._cellRenderer.getCellWidget();
      this._bindItem(widget, row);
      
      if(this._list._manager.isItemSelected(row)) {
        this.styleSelectabled(widget);
      } else {
        this.styleUnselectabled(widget);
      }
      
      return widget;
    },

    poolCellWidget : function(widget) {
      this._removeBindingsFrom(widget);
      this._cellRenderer.pool(widget);
    },

    styleSelectabled : function(item) {
      this._cellRenderer.updateStates(item, {selected: 1});
    },

    styleUnselectabled : function(item) {
      this._cellRenderer.updateStates(item, {});
    },
    
    _onWidgetCreated : function(event)
    {
      var widget = event.getData();
      this._configureItem(widget);
    },
    
    _onChangeDelegate : function(event)
    {
      this._cellRenderer.dispose();
      this._cellRenderer = this._createCellRenderer();
      this.removeBindings();
      this._list.getPane().fullUpdate();
    }
  },

  destruct : function()
  {
    this._cellRenderer.dispose();
    this._cellRenderer = null;
  }
});
