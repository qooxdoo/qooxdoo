qx.OO.defineClass("api.ApiTheme", qx.theme.appearance.DefaultAppearanceTheme.constructor,
function() {
  qx.theme.appearance.DefaultAppearanceTheme.constructor.call(this, "api appearance");
});




qx.Proto._appearances = qx.lang.Object.carefullyMergeWith(
{
  "api-viewer" :
  {
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
      }
    }
  },

  "api-viewer-title" :
  {
    setup : function() {
      this.font = new qx.renderer.font.Font(18, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
      this.font.setBold(true);
    },

    initial : function(vWidget, vTheme) {
      return {
        font: this.font
      }
    }
  },

  "api-viewer-open-button" :
  {
    initial : function(vWidget, vTheme) {
      return {
        paddingLeft: 2,
        paddingRight: 2,
        paddingTop: 2,
        paddingBottom: 2
      }
    }
  },

  "api-viewer-main-info" :
  {
    setup : function() {
      this.border = new qx.renderer.border.Border(2, qx.renderer.border.Border.STYLE_SOLID, "gray");
    },

    initial : function(vWidget, vTheme) {
      return {
        border: this.border
      }
    }
  },

  "api-viewer-main-info-title" :
  {
    setup : function() {
      this.bgcolor = new qx.renderer.color.ColorObject("#E1EEFF");
    },

    initial : function(vWidget, vTheme) {
      return {
        backgroundColor: this.bgcolor
      }
    }
  },

  "api-viewer-main-info-title-label" :
  {
    setup : function() {
      this.font = new qx.renderer.font.Font(16, '"Segoe UI", Corbel, Calibri, Tahoma, "Lucida Sans Unicode", sans-serif');
      this.font.setBold(true);
    },

    initial : function(vWidget, vTheme) {
      return {
        font: this.font,
        paddingLeft: 4
      }
    }
  }
}, qx.Super.prototype._appearances);





/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

api.ApiTheme = new api.ApiTheme;
