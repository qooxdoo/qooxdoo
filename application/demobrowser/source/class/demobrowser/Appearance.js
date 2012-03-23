qx.Theme.define("demobrowser.Appearance",
{
  extend : qx.theme.indigo.Appearance,
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
          width : 270,
          padding: 0,
          decorator: "main"
        };
      }
    }
  }
});
