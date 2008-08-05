/* ************************************************************************

#asset(demobrowser/demo/background/*)

************************************************************************ */

qx.Theme.define("demobrowser.demo.ui.BackgroundImage_Appearance",
{
  title: "Shaded Buttons",

  appearances :
  {
    "shaded-button" :
    {
      style : function(states)
      {
        var root = "demobrowser/demo/";
        return {
          padding: states.pressed ? [11, 10, 9, 10] : 10,
          backgroundColor: states.pressed ? "pressed" : states.hovered ? "hovered" : "normal",
          font: "large",
          decorator: states.pressed ? "shaded-pressed" : "shaded"
        }
      }
    },

    "shaded-button/label" : "label",


    "shaded-round-button" :
    {
      include : "shaded-button",
      alias : "shaded-button",

      style : function(states)
      {
        return {
          decorator: states.pressed ? "shaded-round-pressed" : "shaded-round"
        }
      }
    },


    "shaded-outset-button" :
    {
      include : "shaded-button",
      alias : "shaded-button",

      style : function(states)
      {
        return {
          padding: states.pressed ? [11, 9, 9, 11] : 10,
          decorator: states.pressed ? "shaded-double-pressed" : "shaded-double"
        }
      }
    },


    "glossy" :
    {
      style : function(states)
      {
        var root = "/demo/";
        return {
          width: 126,
          height: 35,
          backgroundImage: states.pressed ? root + "background/glossy-pressed.png" : states.hovered ? root + "background/glossy-over.png" : root + "background/glossy.png",
          textColor: "#cad1e2",
          padding: [0, 15, 0, 15],
          font: new qx.bom.Font().set({
            size: 14,
            family : ["Verdana", "sans-serif"]
          })
        }
      }
    }
  }
});
