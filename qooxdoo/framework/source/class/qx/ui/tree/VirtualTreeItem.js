qx.Class.define("qx.ui.tree.VirtualTreeItem",
{
  extend : qx.ui.tree.core.AbstractItem,
//  extend : qx.ui.tree.core.AbstractTreeItem,


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "tree-folder"
    }
  },


  members :
  {
    getTree : function() {
      return true;
    },


    // overridden
    _addWidgets : function()
    {
      this.addSpacer();
      this.addOpenButton();
      this.addIcon();
      this.addLabel();
    },


    // overridden
    _shouldShowOpenSymbol : function()
    {
      var open = this.getChildControl("open", true);
      if (open == null) {
        return false;
      }

      return this.isOpenable();
    },


    // overridden
    getLevel : function() {
      return this.getUserData("cell.level");
    },


    // overridden
    hasChildren : function() {
      return !!this.getUserData("cell.children");
    }
  }
});