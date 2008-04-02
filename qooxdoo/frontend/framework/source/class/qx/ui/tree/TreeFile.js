qx.Class.define("qx.ui.tree.TreeFile",
{
  extend : qx.ui.tree.AbstractTreeElement,
  implement: qx.ui.tree.ITreeElement,


  construct : function(label)
  {
    this.base(arguments);
    this._label.setContent(label);
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
      this._addSpacer();
      this._addIcon();
      this._addLabel();
    },


    hasChildren : function() {
      return false;
    }
  }
})