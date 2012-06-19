/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("twitter.theme.Appearance",
{
  extend : qx.theme.simple.Appearance,

  appearances :
  {
    "tweet-view" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.selected ? "background-selected" : undefined,
          textColor       : states.selected ? "text-selected" : undefined
        };
      }
    },

    "tweet-view/time" : {
      style : function() {
        return {
          textColor: "tweet-time"
        }
      }
    },

    "toolbar" : {
      style : function() {
        return {
          backgroundColor : "window-border-inner"
        }
      }
    }
  }
});