/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("showcase.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    "page-preview" :
    {
      alias: "listitem",
      include: "listitem",
      
      style : function(states)
      {
        return {
          iconPosition: "top",
          backgroundColor: states.selected ? "#DEFF83" : null,
          textColor: states.selected ? "#444444" : "#F3FFD1",
          padding: 10,
          decorator: null,
          font: qx.bom.Font.fromConfig({
            size: 20,
            family: ["Trebuchet MS", "Lucida Grande", "Verdana", "sans-serif"],
            bold: true
          })
        };
      }
    },
    
    "header":
    {
      style : function(states)
      {
        return {
          backgroundColor: "#134275",
          padding: 5
        };
      }
    },
    
    "content-container" :
    {
      style : function(states)
      {
        return {
          padding: 0
        };
      }
    },
    
    "description-box" :
    {
      alias: "groupbox",
      include: "groupbox",
      
      style : function(states)
      {
        return {
          margin: 10,
          width: 200
        };
      }
    }      
  }
});