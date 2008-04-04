qx.Interface.define("qx.ui.tree.ITreeItem",
{
  properties :
  {
    open : {},
    selected : {},
    parent : {}
  },

  members :
  {
    hasChildren : function() { return true },
    getChildrenContainer : function() { return true },
    getVBoxLayout : function() { return true }
  }
});