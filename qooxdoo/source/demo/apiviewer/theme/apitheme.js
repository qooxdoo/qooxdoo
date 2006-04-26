var theme = qx.manager.object.AppearanceManager.getAppearanceThemeObject();

theme.registerAppearance("api-viewer", {
  setup : function() {
    this.bgcolor = new qx.renderer.color.ColorObject("window");
  },

  initial : function(vWidget, vTheme) {
    return {
      backgroundColor : this.bgcolor,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 10,
      paddingBottom: 10,
      spacing: 10
    };
  }
});


theme.registerAppearance("api-viewer-title", {
  setup : function() {
    this.font = new qx.renderer.font.Font(18, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    this.font.setBold(true);
  },

  initial : function(vWidget, vTheme) {
    return {
      font: this.font
    };
  }
});


theme.registerAppearance("api-viewer-open-button", {
  initial : function(vWidget, vTheme) {
    return {
      paddingLeft: 2,
      paddingRight: 2,
      paddingTop: 2,
      paddingBottom: 2
    };
  }
});


theme.registerAppearance("api-viewer-main-info", {
  setup : function() {
    this.border = new qx.renderer.border.Border(2, qx.Const.BORDER_STYLE_SOLID, "gray");
  },

  initial : function(vWidget, vTheme) {
    return {
      border: this.border
    };
  }
});


theme.registerAppearance("api-viewer-main-info-title", {
  setup : function() {
    this.bgcolor = new qx.renderer.color.ColorObject("#E1EEFF");
  },

  initial : function(vWidget, vTheme) {
    return {
      backgroundColor: this.bgcolor
    };
  }
});


theme.registerAppearance("api-viewer-main-info-title-label", {
  setup : function() {
    this.font = new qx.renderer.font.Font(16, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
    this.font.setBold(true);
  },

  initial : function(vWidget, vTheme) {
    return {
      font: this.font,
      paddingLeft: 4
    };
  }
});


/*
theme.registerAppearance("api-viewer-info", {
  setup : function() {
    this.border = new qx.renderer.border.Border;
    this.border.set({ topWidth:1, topStyle :qx.Const.BORDER_STYLE_SOLID, topColor:"gray" });
    this.bgcolor = new qx.renderer.color.ColorObject("#EEEEEE");
  },

  initial : function(vWidget, vTheme) {
    return {
      border: this.border,
      backgroundColor: this.bgcolor
    };
  }
});


theme.registerAppearance("api-viewer-info-title-label", {
  setup : function() {
    this.font = new qx.renderer.font.Font(11, 'Courier, monospace');
    //this.font.setBold(true);
  },

  initial : function(vWidget, vTheme) {
    return {
      font: this.font,
      paddingLeft: 4
    };
  }
});
*/