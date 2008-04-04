qx.Class.define("qx.ui.tree.TreeFolder",
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
      init : "tree-folder"
    }
  },


  members :
  {
    _addWidgets : function()
    {
      this.addSpacer();
      this.addOpenButton();
      this.addIcon();
      this.addLabel();
    }
  }
})