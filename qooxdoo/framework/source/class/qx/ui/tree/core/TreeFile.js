qx.Class.define("qx.ui.tree.core.TreeFile",
{
  extend : qx.ui.tree.core.AbstractTreeItem,

  
  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "virtual-tree-file"
    }
  },


  members :
  {
    // overridden
    _addWidgets : function()
    {
      this.addSpacer();
      this.addIcon();
      this.addLabel();
    },
    
    
    // overridden
    _updateIndent : function()
    {
      if (this.__spacer) {
        this.__spacer.setWidth((this._getLevel() + 1) * this.getIndent());
      }
    }
  }
});