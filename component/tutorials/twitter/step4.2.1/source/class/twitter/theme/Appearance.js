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
    "tweet-view" : {},

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