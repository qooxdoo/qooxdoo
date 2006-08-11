// theme.js

/*
---------------------------------------------------------------------------
  DIALOG
---------------------------------------------------------------------------
*/

theme.registerAppearance("dialog",
{
  setup : function()
  {
    this.bgcolor = new qx.renderer.color.ColorObject("threedface");
    this.color = new qx.renderer.color.ColorObject("windowtext");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.bgcolor,
      color : this.color,
      paddingTop : 1,
      paddingRight : 1,
      paddingBottom : 1,
      paddingLeft : 1
    }
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      border : vStates.maximized ? qx.renderer.border.BorderObject.presets.none : qx.renderer.border.BorderObject.presets.outset
    }
  }
});
