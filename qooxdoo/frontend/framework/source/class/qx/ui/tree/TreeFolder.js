qx.Class.define("qx.ui.tree.TreeFolder",
{
  extend : qx.ui.tree.AbstractTreeElement,


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