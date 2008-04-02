qx.Interface.define("qx.ui.core.ISelectionContainer",
{
  members :
  {
    getNextSiblingOf : function(listItem) {
      return true;
    },

    getPreviousSiblingOf : function(listItem) {
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