qx.Class.define("showcase.page.table.Content",
{
  extend : showcase.AbstractContent,
  
  members :
  {
    getView : function()
    {
      var table = qx.ui.table.Table;
  
      return this._view || (this._view = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "yellow"
      }));
    }
  }
});