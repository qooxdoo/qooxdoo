qx.Interface.define("qx.ui.tree.ITreeElement",
{
  properties :
  {
    open : {},
    selected : {},
    level : {},
    tree : {},
    parent : {}
  },

  members :
  {
    hasChildren : function() { return true }
  }
});