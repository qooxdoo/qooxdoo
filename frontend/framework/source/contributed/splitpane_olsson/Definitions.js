// theme.js

/*
---------------------------------------------------------------------------
  SPLITPANE
---------------------------------------------------------------------------
*/

theme.registerAppearance("splitpane",
{
  setup : function()
  {
    this.bgcolor = new qx.renderer.color.ColorObject("threedface");
  },

  initial : function(vWidget, vTheme)
  {
    return {
      backgroundColor : this.bgcolor
    }
  },

  state : function(vWidget, vTheme, vStates)
  {
    var firstLevel = vWidget.getParent() instanceof QxSplitPane;

    var vReturn = {
      border : firstLevel ? null : qx.renderer.border.BorderObject.presets.thinInset
    }

    return vReturn;
  }
});

theme.registerAppearance("splitpane-divider",
{
  initial : function(vWidget, vTheme)
  {
    return {
      border : qx.renderer.border.BorderObject.presets.thinOutset
    }
  }
});

theme.registerAppearance("splitpane-move-frame",
{
  initial : function(vWidget, vTheme)
  {
    return {
      border : qx.renderer.border.BorderObject.presets.shadow
    }
  }
});

theme.registerAppearance("splitpane-button",
{
  setup : function()
  {
    this.bgcolor_default = new qx.renderer.color.ColorObject("buttonface");
    this.bgcolor_over = new qx.renderer.color.Color("#87BCE5");
    this.bgcolor_left = new qx.renderer.color.Color("#FFF0C9");

    this.border_pressed = qx.renderer.border.BorderObject.presets.inset;
    this.border_default = qx.renderer.border.BorderObject.presets.outset;
  },

  initial : function(vWidget, vTheme) {
    return vTheme.initialFrom(vWidget, "button");
  },

  state : function(vWidget, vTheme, vStates)
  {
    var vReturn = {
      backgroundColor : vStates.abandoned ? this.bgcolor_left : vStates.over ? this.bgcolor_over : this.bgcolor_default,
      border : vStates.pressed || vStates.checked || vStates.abandoned ? this.border_pressed : this.border_default
    }

    return vReturn;
  }
});