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

    this._renderer = this.__createRenderer();
  },


  members :
  {
    /** {qx.ui.tree.VirtualTree} tree to provide. */
    _tree : null,
    
    /** {qx.ui.virtual.cell.WidgetCell} the used item renderer */
    _renderer : null,


    // interface implementation
    getCellWidget : function(row, column)
    {
      var item = this._tree.getLookupTable()[row];
      
      var widget = this._renderer.getCellWidget();
      widget.setLabel(item.name);
      
      return widget;
    },


    // interface implementation
    poolCellWidget : function(widget) {
      this._renderer.pool(widget);
    },


    createLayer : function() {
      return new qx.ui.virtual.layer.WidgetCell(this);
    },


    __createRenderer : function()
    {
      var renderer = new qx.ui.virtual.cell.WidgetCell();
      renderer.setDelegate({
        createWidget : function() {
          return new qx.ui.form.ListItem();
        }
      });

      return renderer;
    }
  },


  destruct : function()
  {
    this._renderer.dispose();
    this._tree = this._renderer = null;
  }
});