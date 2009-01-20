/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.LayerMock",
{
  extend : qx.ui.core.Widget, 
  
  construct : function() 
  {
    this.base(arguments);
    
    this.calls = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    fullUpdate : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.calls.push(["fullUpdate", qx.lang.Array.fromArguments(arguments)]);
    },
    
    
    updateScrollPosition : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.calls.push(["updateScrollPosition", qx.lang.Array.fromArguments(arguments)]);
    }
  }
});
