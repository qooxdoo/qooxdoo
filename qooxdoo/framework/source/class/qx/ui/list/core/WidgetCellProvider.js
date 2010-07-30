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
 *
 * The provider implemets the {@link qx.ui.virtual.core.IWidgetCellProvider} API,
 * which can be used as delegate for the widget cell rendering and it
 * provides a API to bind the model with the rendered item.
 */
qx.Class.define("qx.ui.list.core.WidgetCellProvider",
{
  extend : qx.core.Object,
  implement : qx.ui.virtual.core.IWidgetCellProvider,
  include : [qx.ui.list.core.MWidgetCellController],

  /**
   * Creates the <code>WidgetCellProvider</code>
   *
   * @param list {qx.ui.list.List} list to provide.
   */
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
    /** {} the used cell renderer */
    _cellRenderer : null,

    // interface implementation
    getCellWidget : function(row, column)
    {
      var widget = this._cellRenderer.getCellWidget();
      this._bindItem(widget, row);

      if(this._list._manager.isItemSelected(row)) {
        this.styleSelectabled(widget);
      } else {
        this.styleUnselectabled(widget);
      }

      return widget;
    },

    // interface implementation
    poolCellWidget : function(widget) {
      this._removeBindingsFrom(widget);
      this._cellRenderer.pool(widget);
    },

    /**
     * Styles a selected item.
     *
     * @param item {qx.ui.core.Widget} widget to style.
     */
    styleSelectabled : function(item) {
      this._cellRenderer.updateStates(item, {selected: 1});
    },

    /**
     * Styles a not selected item.
     *
     * @param item {qx.ui.core.Widget} widget to style.
     */
    styleUnselectabled : function(item) {
      this._cellRenderer.updateStates(item, {});
    },

    /**
     * Event handler for the created widget event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onWidgetCreated : function(event)
    {
      var widget = event.getData();
      this._configureItem(widget);
    },

    /**
     * Event handler for the change delegate event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onChangeDelegate : function(event)
    {
      this._cellRenderer.dispose();
      this._cellRenderer = this._createCellRenderer();
      this._cellRenderer.addListener("created", this._onWidgetCreated, this);
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
