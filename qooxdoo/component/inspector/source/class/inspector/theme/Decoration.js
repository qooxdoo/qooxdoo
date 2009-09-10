/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("inspector.theme.Decoration",
{
  extend : qx.theme.modern.Decoration,

  decorations :
  {
    "myToolbar" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-main",
        backgroundImage  : "decoration/toolbar/toolbar-gradient.png",
        backgroundRepeat : "scale"
      }
    }
  }
});