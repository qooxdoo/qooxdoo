qx.Class.define("qx.ui.tree.TreeFolder",
{
  extend : qx.ui.tree.AbstractTreeElement,
  include : qx.ui.tree.MTreeFolder,
  implement: qx.ui.tree.ITreeFolder,

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
      this._addSpacer();
      this._addOpenButton();
      this._addIcon();
      this._addLabel();
    }
  }
})