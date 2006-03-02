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
    this.bgcolor = new QxColorObject("threedface");
    this.color = new QxColorObject("windowtext");
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
    };
  },

  state : function(vWidget, vTheme, vStates)
  {
    return {
      border : vStates.maximized ? QxBorderObject.presets.none : QxBorderObject.presets.outset
    };
  }
});