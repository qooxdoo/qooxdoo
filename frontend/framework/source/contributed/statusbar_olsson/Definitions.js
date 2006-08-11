// theme.js

/*
---------------------------------------------------------------------------
  STATUSBAR
---------------------------------------------------------------------------
*/

theme.registerAppearance("statusbar",
{
  setup : function()
  {
    this.bgcolor = new qx.renderer.color.ColorObject("threedface");
  },
  initial : function(vWidget, vTheme)
  {
    return {
      width : null,
      height : 24,
      overflow : qx.constant.Style.OVERFLOW_HIDDEN,
      backgroundColor : this.bgcolor,
      border : qx.renderer.border.BorderObject.presets.outset,
      paddingTop : 1,
      paddingRight : 1,
      paddingBottom : 1,
      paddingLeft : 1
    }
  }
});

theme.registerAppearance("statusbar-pane",
{
  initial : function(vWidget,vTheme)
  {
    return{
      width : qx.constant.Core.AUTO,
      height : null,
      border : qx.renderer.border.BorderObject.presets.inset
    }
  }
});

theme.registerAppearance("statusbar-widget",
{
  initial : function(vWidget,vTheme)
  {
    return{
      paddingRight : 1,
      paddingLeft : 1
    }
  }
});
