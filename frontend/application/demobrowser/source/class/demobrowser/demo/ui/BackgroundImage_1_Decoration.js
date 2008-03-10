qx.Theme.define("demobrowser.demo.ui.BackgroundImage_1_Decoration",
{
  title: "Shaded Buttons - Decorations",

  decorations :
  {
    "shaded" :
    {
      style :
      {
        width: 1,
        color: "#334563",
        style: "solid",
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient.png",
        backgroundRepeat: "repeat-x"
      }
    },

    "shaded-pressed" :
    {
      style :
      {
        width: 1,
        color: "#334563",
        style: "solid",
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient-pressed.png",
        backgroundRepeat: "repeat-x"
      }
    },


    "shaded-round" :
    {
      decorator: qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 4,
        width: 1,
        color: "#334563",
        style: "solid",
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient.png",
        backgroundRepeat: "repeat-x"
      }
    },

    "shaded-round-pressed" :
    {
      decorator: qx.ui.decoration.RoundedBorder,

      style :
      {
        radius: 4,
        width: 1,
        color: "#334563",
        style: "solid",
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient-pressed.png",
        backgroundRepeat: "repeat-x"
      }
    },


    "shaded-double" :
    {
      decorator: qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient.png",
        backgroundRepeat: "repeat-x"
      }
    },

    "shaded-double-pressed" :
    {
      decorator: qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ],
        backgroundImage: qx.core.Setting.get("demobrowser.resourceUri") + "/demobrowser/demo/" + "background/gradient-pressed.png",
        backgroundRepeat: "repeat-x"
      }
    }

  }
});