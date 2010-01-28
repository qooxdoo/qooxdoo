/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("inspector.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "toolbar-button-bold" :
    {
      alias : "toolbar-button",
      include : "toolbar-button",
      
      style : function(states)
      {
        return {
          textColor : "green",
          font : "bold"
        };
      }
    }
  }
});