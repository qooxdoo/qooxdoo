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
 * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider} API,
 * which can be used as delegate for the widget cell rendering and it
 * provides a API to bind the model with the rendered item.
 *
 * @internal
 */
qx.Class.define("qx.ui.list.provider.WidgetProvider",
{
  extend : qx.core.Object,

  implement : [
   qx.ui.virtual.core.IWidgetCellProvider,
   qx.ui.list.provider.IListProvider
  ],

  include : [qx.ui.list.core.MWidgetController],


  /**
   * Creates the <code>WidgetProvider</code>
   *
   * @param list {qx.ui.list.List} list to provide.
   */
  construct : function(list)
  {
    this.base(arguments);

    this._list = list;

    this._cellRenderer = this.createItemRenderer();
    this._groupRenderer = this.createGroupRenderer();

    this._cellRenderer.addListener("created", this._onWidgetCreated, this);
    this._list.addListener("changeDelegate", this._onChangeDelegate, this);
  },


  members :
  {
    /** {qx.ui.virtual.cell.WidgetCell} the used cell renderer */
    _cellRenderer : null,


    /** {qx.ui.virtual.cell.WidgetCell} the used group renderer */
    _groupRenderer : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // interface implementation
    getCellWidget : function(row, column)
    {
      var widget = null;

      if (!this._list._isGroup(row))
      {
        widget = this._cellRenderer.getCellWidget();
        widget.setUserData("cell.type", "item");
        this._bindItem(widget, this._list._lookup(row));

        if(this._list._manager.isItemSelected(row)) {
          this._styleSelectabled(widget);
        } else {
          this._styleUnselectabled(widget);
        }
      }
      else
      {
        widget = this._groupRenderer.getCellWidget({value: null});
        widget.setUserData("cell.type", "header");

        // TODO this is due to binding feature is missing
        widget.setValue(this._list._getDataFromRow(row));
      }

      return widget;
    },


    // interface implementation
    poolCellWidget : function(widget) {
      this._removeBindingsFrom(widget);

      if (widget.getUserData("cell.type") == "item") {
        this._cellRenderer.pool(widget);
      } else if (widget.getUserData("cell.type") == "header") {
        this._groupRenderer.pool(widget);
      }
    },


    // interface implementation
    createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    // interface implementation
    createItemRenderer : function()
    {
      var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

      if (createWidget == null) {
        createWidget = function() {
          return new qx.ui.form.ListItem();
        }
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : createWidget
      });

      return renderer;
    },


    // interface implementation
    createGroupRenderer : function() {
      var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createGroupItem");

      if (createWidget == null)
      {
        createWidget = function()
        {
          var group = new qx.ui.basic.Label();

          // TODO add appearance for header
          group.setDecorator("selected");
          group.setPadding([4, 8, 4, 8]);
          group.setTextColor("text-selected");
          group.setTextAlign("right");

          return group;
        }
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : createWidget
      });

      return renderer;
    },


    // interface implementation
    styleSelectabled : function(row)
    {
      var widget = this.__getWidgetFrom(row);
      this._styleSelectabled(widget);
    },


    // interface implementation
    styleUnselectabled : function(row)
    {
      var widget = this.__getWidgetFrom(row);
      this._styleUnselectabled(widget);
    },


    // interface implementation
    isSelectable : function(row)
    {
      if (this._list._isGroup(row)) {
        return false;
      }

      var widget = this._list._layer.getRenderedCellWidget(row, 0);

      if (widget != null) {
        return widget.isEnabled();
      } else {
        return true;
      }
    },


    /*
    ---------------------------------------------------------------------------
      INTERNAL API
    ---------------------------------------------------------------------------
    */


    /**
     * Styles a selected item.
     *
     * @param widget {qx.ui.core.Widget} widget to style.
     */
    _styleSelectabled : function(widget) {
      this.__updateStates(widget, {selected: 1});
    },


    /**
     * Styles a not selected item.
     *
     * @param widget {qx.ui.core.Widget} widget to style.
     */
    _styleUnselectabled : function(widget) {
      this.__updateStates(widget, {});
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


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
      this._cellRenderer = this.createItemRenderer();
      this._cellRenderer.addListener("created", this._onWidgetCreated, this);
      this.removeBindings();
      this._list.getPane().fullUpdate();
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */


    /**
     * Helper method to get the widget from the passed row.
     *
     * @param row {Integer} row to search.
     * @return {qx.ui.core.Widget|null} The found widget or <code>null</code> when no widget found.
     */
    __getWidgetFrom : function(row) {
      return this._list._layer.getRenderedCellWidget(row, 0);
    },


    /**
     * Helper method to update the states from a widget.
     *
     * @param widget {qx.ui.core.Widget} widget to set states.
     * @param states {Map} the state to set.
     */
    __updateStates : function(widget, states)
    {
      if(widget == null) {
        return;
      }

      this._cellRenderer.updateStates(widget, states);
    }
  },


  destruct : function()
  {
    this._cellRenderer.dispose();
    this._groupRenderer.dispose();
    this._cellRenderer = this._groupRenderer = null;
  }
});