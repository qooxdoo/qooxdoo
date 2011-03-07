qx.Class.define("qx.ui.tree.VirtualTreeFile",
{
  extend : qx.ui.tree.core.AbstractVirtualTreeItem,

  
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
      if (this._spacer) {
        this._spacer.setWidth((this._getLevel() + 1) * this.getIndent());
      }
    }
  }
});