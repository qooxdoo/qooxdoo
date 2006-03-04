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
    this.bgcolor = new QxColorObject("threedface");
  },
  initial : function(vWidget, vTheme)
  {
    return {
      width : null,
      height : 24,
      overflow : QxConst.OVERFLOW_VALUE_HIDDEN,
      backgroundColor : this.bgcolor,
      border : QxBorderObject.presets.outset,
      paddingTop : 1,
      paddingRight : 1,
      paddingBottom : 1,
      paddingLeft : 1
    };
  }
});

theme.registerAppearance("statusbar-pane",
{
  initial : function(vWidget,vTheme)
  {
    return{
      width : QxConst.CORE_AUTO,
      height : null,
      border : QxBorderObject.presets.inset
    };
  }
});

theme.registerAppearance("statusbar-widget",
{
  initial : function(vWidget,vTheme)
  {
    return{
      paddingRight : 1,
      paddingLeft : 1
    };
  }
});
