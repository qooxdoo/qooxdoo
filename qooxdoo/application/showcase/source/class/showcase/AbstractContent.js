qx.Class.define("showcase.AbstractContent",
{
  extend : qx.core.Object,
  
  construct : function(page) {
    this.setPage(page);
  },
  
  
  properties :
  {
    page : {
      check: "showcase.Page"
    }
  },
  
  members :
  {
    getView : function() {
      throw new Error("Abstract method call!");
    },
    
    getControl : function() {
      throw new Error("Abstract method call!");
    }
  }
});