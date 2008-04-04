qx.Interface.define("qx.ui.core.ISelectionContainer",
{
  members :
  {
    getNextSelectableItem : function(selectedItem) {
      return true;
    },

    getPreviousSelectableItem : function(selectedItem) {
      return true;
    },

    getScrollTop : function() {
      return true;
    },

    setScrollTop : function(scroll) {
      return true;
    },

    getSelectableItems : function() {
      return true;
    },

    getInnerHeight : function() {
      return true;
    }
  }
});