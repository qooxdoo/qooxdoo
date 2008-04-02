qx.Interface.define("qx.ui.tree.ITreeFolder",
{
  extend : qx.ui.tree.ITreeElement,

  members :
  {
    getChildrenContainer : function() { return true },
    getVBoxLayout : function() { return true }
  }
});