qx.Theme.define("qx.test.theme.manager.mock.Decoration",
{
  extend : qx.theme.modern.Decoration,

  decorations :
  {
    "button" :
    {
      style :
      {
        radius: 10,
        color: "border-button",
        width: 2,
        startColor: "button-start",
        endColor: "button-end",
        startColorPosition: 35,
        endColorPosition: 100
      }
    }
  }
});
