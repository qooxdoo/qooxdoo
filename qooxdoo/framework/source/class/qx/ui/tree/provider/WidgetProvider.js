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

    this._nodeRenderer = this.createNodeRenderer();
    this._leafRenderer = this.createLeafRenderer();
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
      var item = this._tree.getLookupTable()[row];

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
      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : function() {
          return new qx.ui.tree.VirtualTreeFolder();
        }
      });

      return renderer;
    },


    // Interface implementation
    createLeafRenderer : function()
    {
      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : function() {
          return new qx.ui.tree.VirtualTreeFile();
        }
      });

      return renderer;
    },

    
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLERS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Handler when a node changes opened or closed state.
     * 
     * @param event {qx.event.type.Data} The data event.
     */
    __onOpenChanged : function(event)
    {
      var widget = event.getTarget();

      var row = widget.getUserData("cell.row");
      var item = this._tree.getLookupTable()[row];
      if (event.getData()) {
        this._tree.openNode(item);
      } else {
        this._tree.closeNode(item);
      }
    }
  },


  destruct : function()
  {
    this._nodeRenderer.dispose();
    this._leafRenderer.dispose();
    this._tree = this._nodeRenderer = this._leafRenderer = null;
  }
});