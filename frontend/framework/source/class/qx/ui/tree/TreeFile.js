qx.Class.define("qx.ui.tree.TreeFile",
{
  extend : qx.ui.tree.AbstractTreeItem,


  construct : function(label)
  {
    this.base(arguments);
    if (label) {
      this._label.setContent(label);
    }
  },


  properties :
  {
    appearance :
    {
      refine : true,
      init : "tree-file"
    }
  },


  members :
  {
    _addWidgets : function()
    {
      this.addSpacer();
      this.addIcon();
      this.addLabel();
    },


    hasChildren : function() {
      return false;
    }
  }
})