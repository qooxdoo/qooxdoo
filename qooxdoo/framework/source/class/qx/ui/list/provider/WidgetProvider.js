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

    this._cellRenderer = this.createItemRenderer();
    this._list = list;

    this._cellRenderer.addListener("created", this._onWidgetCreated, this);
    this._list.addListener("changeDelegate", this._onChangeDelegate, this);
  },

  
  members :
  {
    /** {qx.ui.virtual.cell.WidgetCell} the used cell renderer */
    _cellRenderer : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // interface implementation
    getCellWidget : function(row, column)
    {
      var widget = this._cellRenderer.getCellWidget();
      this._bindItem(widget, this._list._lookup(row));

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
      throw new Error("Feature not implemented!");
    },


    // interface implementation
    styleSelectabled : function(item) {
      if(item == null) {
        return;
      }
      this._cellRenderer.updateStates(item, {selected: 1});
    },


    // interface implementation
    styleUnselectabled : function(item) {
      if(item == null) {
        return;
      }
      this._cellRenderer.updateStates(item, {});
    },


    // interface implementation
    isSelectable : function(row)
    {
      var widget = this._list._layer.getRenderedCellWidget(row, 0);

      if (widget != null) {
        return widget.isEnabled();
      } else {
        return true;
      }
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
    }
  },


  destruct : function()
  {
    this._cellRenderer.dispose();
    this._cellRenderer = null;
  }
});