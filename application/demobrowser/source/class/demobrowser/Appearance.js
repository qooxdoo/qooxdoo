qx.Theme.define("demobrowser.Appearance",
{
  extend : qx.theme.modern.Appearance,
  title : "Demo browser",

  appearances :
  {
    "demo-tree" : 
    {
      alias : "tree",
      include : "tree",
      
      style : function()
      {
        return {
          width : 250,
          decorator : "main"
        };
      }
    }
  }
});
