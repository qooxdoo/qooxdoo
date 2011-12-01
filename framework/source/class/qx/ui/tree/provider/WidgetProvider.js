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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/**
 * The provider implements the {@link qx.ui.virtual.core.IWidgetCellProvider}
 * API, which can be used as delegate for the widget cell rendering and it
 * provides a API to bind the model with the rendered item.
 *
 * @internal
 */
qx.Class.define("qx.ui.tree.provider.WidgetProvider",
{
  extend : qx.core.Object,

  implement : [
   qx.ui.virtual.core.IWidgetCellProvider,
   qx.ui.tree.provider.IVirtualTreeProvider
  ],

  include : [qx.ui.tree.core.MWidgetController],


  /**
   * @param tree {qx.ui.tree.VirtualTree} tree to provide.
   */
  construct : function(tree)
  {
    this.base(arguments);

    this._tree = tree;

    this.addListener("changeDelegate", this._onChangeDelegate, this);
    this._onChangeDelegate();
  },


  members :
  {
    /** {qx.ui.tree.VirtualTree} tree to provide. */
    _tree : null,


    /** {qx.ui.virtual.cell.WidgetCell} the used item renderer. */
    _renderer : null,


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */


    // interface implementation
    getCellWidget : function(row, column)
    {
      var item = this._tree.getLookupTable().getItem(row);

      var hasChildren = false;
      if (this._tree.isNode(item)) {
        hasChildren = this._tree.hasChildren(item);
      }

      var widget = this._renderer.getCellWidget();
      widget.setOpen(hasChildren && this._tree.isNodeOpen(item));
      widget.setUserData("cell.children", hasChildren);
      widget.addListener("changeOpen", this.__onOpenChanged, this);

      if(this._tree.getSelection().contains(item)) {
        this._styleSelectabled(widget);
      } else {
        this._styleUnselectabled(widget);
      }

      var level = this._tree.getLevel(row);
      if (!this._tree.isShowTopLevelOpenCloseIcons()) {
        level -= 1;
      }
      widget.setUserData("cell.level", level);

      if (!this._tree.isShowTopLevelOpenCloseIcons() && level == -1) {
        widget.setOpenSymbolMode("never");
      } else {
        widget.setOpenSymbolMode("auto");
      }

      this._bindItem(widget, row);
      qx.ui.core.queue.Widget.add(widget);

      return widget;
    },


    // interface implementation
    poolCellWidget : function(widget)
    {
      widget.removeListener("changeOpen", this.__onOpenChanged, this);
      this._removeBindingsFrom(widget);
      this._renderer.pool(widget);
      this._onPool(widget);
    },


    // Interface implementation
    createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    // Interface implementation
    createRenderer : function()
    {
      var createItem = qx.util.Delegate.getMethod(this.getDelegate(), "createItem");

      if (createItem == null) {
        createItem = function() {
          return new qx.ui.tree.VirtualTreeItem();
        }
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : createItem
      });

      return renderer;
    },


    // interface implementation
    styleSelectabled : function(row)
    {
      var widget = this._tree._layer.getRenderedCellWidget(row, 0);
      this._styleSelectabled(widget);
    },


    // interface implementation
    styleUnselectabled : function(row)
    {
      var widget = this._tree._layer.getRenderedCellWidget(row, 0);
      this._styleUnselectabled(widget);
    },


    // interface implementation
    isSelectable : function(row)
    {
      var widget = this._tree._layer.getRenderedCellWidget(row, 0);
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
      if(widget == null) {
        return;
      }

      this._renderer.updateStates(widget, {selected: 1});
    },


    /**
     * Styles a not selected item.
     *
     * @param widget {qx.ui.core.Widget} widget to style.
     */
    _styleUnselectabled : function(widget) {
      if(widget == null) {
        return;
      }

      this._renderer.updateStates(widget, {});
    },


    /**
     * Calls the delegate <code>onPool</code> method when it is used in the
     * {@link #delegate} property.
     *
     * @param item {qx.ui.core.Widget} Item to modify.
     */
    _onPool : function(item)
    {
      var onPool = qx.util.Delegate.getMethod(this.getDelegate(), "onPool");

      if (onPool != null) {
        onPool(item);
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */


    /**
     * Event handler for the created item's.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onItemCreated : function(event)
    {
      var configureItem = qx.util.Delegate.getMethod(this.getDelegate(), "configureItem");

      if (configureItem != null) {
        var leaf = event.getData();
        configureItem(leaf);
      }
    },


    /**
     * Event handler for the change delegate event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onChangeDelegate : function(event)
    {
      if (this._renderer != null) {
        this._renderer.dispose();
        this.removeBindings();
      }

      this._renderer = this.createRenderer();
      this._renderer.addListener("created", this._onItemCreated, this);
    },


    /**
     * Handler when a node changes opened or closed state.
     *
     * @param event {qx.event.type.Data} The data event.
     */
    __onOpenChanged : function(event)
    {
      var widget = event.getTarget();

      var row = widget.getUserData("cell.row");
      var item = this._tree.getLookupTable().getItem(row);
      if (event.getData()) {
        this._tree.openNode(item);
      } else {
        this._tree.closeNode(item);
      }
    }
  },


  destruct : function()
  {
    this.removeBindings();
    this._renderer.dispose();
    this._tree = this._renderer = null;
  }
});