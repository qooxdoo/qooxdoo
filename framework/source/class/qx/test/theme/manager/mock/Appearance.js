qx.Theme.define("qx.test.theme.manager.mock.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "button-frame" :
    {
      alias : "atom",

      style : function(states)
      {
        return {
          decorator : "button",
          padding : [30, 80]
        };
      }
    },


    "button-frame/label" : {
      alias : "atom/label",

      style : function(states)
      {
        return {
          textColor : "text-label"
        };
      }
    }
  }
});
