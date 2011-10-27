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
    },

    "inspector-window" :
    {
      alias : "window",
      include : "window",

      style : function(states)
      {
        return {
          contentPadding : [ 0, 0, 0, 0 ],
          showMinimize : false,
          showMaximize : false,
          width : 300,
          height : 200
        };
      }
    },

    /*
     * Objects Window
     */

    "objects-toolbar" :
    {
      alias : "toolbar",
      include : "toolbar",

      style : function(states)
      {
        return {
          paddingLeft : 3,
          paddingRight : 3
        };
      }
    },

    "objects-textfield" :
    {
      alias : "textfield",
      include : "textfield",

      style : function(states)
      {
        return {
          marginRight : 5
        };
      }
    },

    "objects-table" :
    {
      alias : "table",
      include : "table",

      style : function(states)
      {
        return {
          decorator : null
        };
      }
    }
  }
});