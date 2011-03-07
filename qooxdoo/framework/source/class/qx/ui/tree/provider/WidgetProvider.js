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
 * EXPERIMENTAL!
 * 
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


  properties :
  {
    /**
     * The name of the property, where the children are stored in the model.
     * Instead of the {@link #labelPath} must the child property a direct
     * property form the model instance.
     */
    childProperty :
    {
      check: "String",
      nullable: true
    }
  },


  members :
  {
    /** {qx.ui.tree.VirtualTree} tree to provide. */
    _tree : null,


    /** {qx.ui.virtual.cell.WidgetCell} the used node renderer. */
    _nodeRenderer : null,


    /** {qx.ui.virtual.cell.WidgetCell} the used node renderer. */
    _leafRenderer : null,

    
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */
    

    // interface implementation
    getCellWidget : function(row, column)
    {
      var item = this._tree.getLookupTable().getItem(row);

      var widget = null;
      if (this._tree.isNode(item))
      {
        var hasChildren = this._tree.hasChildren(item);
        widget = this._nodeRenderer.getCellWidget();
        widget.setOpen(hasChildren && this._tree.isNodeOpen(item));
        widget.setUserData("cell.type", "node");
        widget.setUserData("cell.children", hasChildren);
        widget.addListener("changeOpen", this.__onOpenChanged, this);
        this._bindNode(widget, row);
      }
      else
      {
        widget = this._leafRenderer.getCellWidget();
        widget.setUserData("cell.type", "leaf");
        this._bindLeaf(widget, row);
      }
      
      if(this._tree.getSelection().contains(item)) {
        this._styleSelectabled(widget);
      } else {
        this._styleUnselectabled(widget);
      }
      
      widget.setUserData("cell.level", this._tree.getLevel(row));
      qx.ui.core.queue.Widget.add(widget);

      return widget;
    },


    // interface implementation
    poolCellWidget : function(widget)
    {
      var type = widget.getUserData("cell.type");
      this._removeBindingsFrom(widget);

      if (type === "node")
      {
        widget.removeListener("changeOpen", this.__onOpenChanged, this);
        this._nodeRenderer.pool(widget);
      }
      else {
        this._leafRenderer.pool(widget);
      }
    },


    // Interface implementation
    createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    // Interface implementation
    createNodeRenderer : function()
    {
      var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createNode");

      if (createWidget == null) {
        createWidget = function() {
          return new qx.ui.tree.VirtualTreeFolder();
        }
      }

      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : createWidget
      });

      return renderer;
    },


    // Interface implementation
    createLeafRenderer : function()
    {
      var createWidget = qx.util.Delegate.getMethod(this.getDelegate(), "createLeaf");

      if (createWidget == null) {
        createWidget = function() {
          return new qx.ui.tree.VirtualTreeFile();
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

      var type = widget.getUserData("cell.type");
      if (type === "node") {
        this._nodeRenderer.updateStates(widget, {selected: 1});
      } else {
        this._leafRenderer.updateStates(widget, {selected: 1});
      }
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

      var type = widget.getUserData("cell.type");
      if (type === "node") {
        this._nodeRenderer.updateStates(widget, {});
      } else {
        this._leafRenderer.updateStates(widget, {});
      }
    },
    
    
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */
    
    
    /**
     * Event handler for the created node widget event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onNodeCreated : function(event)
    {
      var configureNode = qx.util.Delegate.getMethod(this.getDelegate(), "configureNode");
      
      if (configureNode != null) {
        var node = event.getData();
        configureNode(node);
      }
    },
    
    
    /**
     * Event handler for the created leaf widget event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onLeafCreated : function(event)
    {
      var configureLeaf = qx.util.Delegate.getMethod(this.getDelegate(), "configureLeaf");
      
      if (configureLeaf != null) {
        var leaf = event.getData();
        configureLeaf(leaf);
      }
    },
    
    
    /**
     * Event handler for the change delegate event.
     *
     * @param event {qx.event.type.Data} fired event.
     */
    _onChangeDelegate : function(event)
    {
      if (this._nodeRenderer != null && this._leafRenderer != null) {
        this._nodeRenderer.dispose();
        this._leafRenderer.dispose();
        this.removeBindings();
      }
      
      this._nodeRenderer = this.createNodeRenderer();
      this._leafRenderer = this.createLeafRenderer();
      this._nodeRenderer.addListener("created", this._onNodeCreated, this);
      this._leafRenderer.addListener("created", this._onLeafCreated, this);
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
    this._nodeRenderer.dispose();
    this._leafRenderer.dispose();
    this._tree = this._nodeRenderer = this._leafRenderer = null;
  }
});