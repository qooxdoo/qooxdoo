/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("fce.theme.Appearance",
{
  extend : qx.theme.simple.Appearance,

  appearances :
  {
    "listitem/checkbox" : 
    {
      alias : "checkbox",
      include : "checkbox",
      
      style : function(states)
      {
        return {
          padding : [0, 35, 0, 0]
        };
      }
    }
  }
});