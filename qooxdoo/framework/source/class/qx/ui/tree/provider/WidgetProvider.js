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
 * @internal
 */
qx.Class.define("qx.ui.tree.provider.WidgetProvider",
{
  extend : qx.core.Object,


  implement : [
   qx.ui.virtual.core.IWidgetCellProvider
  ],


  /**
   * @param tree {qx.ui.tree.VirtualTree} tree to provide.
   */
  construct : function(tree)
  {
    this.base(arguments);

    this._tree = tree;

    this._nodeRenderer = this.__createNodeRenderer();
    this._leafRenderer = this.__createLeafRenderer();
  },


  properties :
  {
    openMode :
    {
      check: ["click", "dblclick", "none"],
      init: "dblclick",
      event: "changeOpenMode"
    },


    rootOpenClose :
    {
      check: "Boolean",
      init: false
    },


    childProperty :
    {
      check: "String",
      nullable: true
    },


    labelPath :
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
      }
      else
      {
        widget = this._leafRenderer.getCellWidget();
        widget.setUserData("cell.type", "leaf");
      }
      widget.setUserData("cell.level", this._tree.getLevel(row));
      var name = qx.data.SingleValueBinding.getValueFromObject(item, 
        this.getLabelPath()); 
      widget.setLabel(name);
      qx.ui.core.queue.Widget.add(widget);

      return widget;
    },


    // interface implementation
    poolCellWidget : function(widget)
    {
      var type = widget.getUserData("cell.type");

      if (type === "node")
      {
        widget.removeListener("changeOpen", this.__onOpenChanged, this);
        this._nodeRenderer.pool(widget);
      }
      else {
        this._leafRenderer.pool(widget);
      }
    },


    createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    __createNodeRenderer : function()
    {
      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : function() {
          return new qx.ui.tree.VirtualTreeFolder();
        }
      });

      return renderer;
    },


    __createLeafRenderer : function()
    {
      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : function() {
          return new qx.ui.tree.VirtualTreeFile();
        }
      });

      return renderer;
    },


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