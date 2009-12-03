qx.Class.define("showcase.page.theme.Content",
{
  extend : showcase.AbstractContent,
  
  members :
  {
    getView : function()
    {
      return this._view || (this._view = new qx.ui.core.Widget().set({
        decorator: "main",
        backgroundColor: "green"
      }));
    }
  }
});