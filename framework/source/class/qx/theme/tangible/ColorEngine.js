/* ************************************************************************

  Tangible Theme for Qooxdoo

  Copyright:
     2018 IT'IS Foundation
     2020 Tobi Oetiker

  License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

  Authors:
    * Tobias Oetiker (oetiker)

  Origin:
    This theme is inspired by ideas from Material design.
************************************************************************ */
/**
 * Simple color theme
 */

var helper = {
  tone: function (color) {
    if (color == "dark" || color == "light") {
      return color;
    }
    var minimumContrast = 3.1;
    var lightContrast = qx.util.ColorUtil.contrast(color, "#fff");
    var darkContrast = qx.util.ColorUtil.contrast(color, "rgba(0,0,0,0.87)");
    if ((lightContrast < minimumContrast)
      && (darkContrast > lightContrast)) {
      return "light";
    }
    else {
      return "dark";
    }
  },
  /**
   * contrastTone
   *
   * Should dark or light text be used on top of the given
   * color to get readable text.
   *
   * @param color {String} a valid qooxdoo/CSS rgb color string
   * @return {String} "dark" if color is light and vise versa
   */
  contrastTone: function (color) {
    return helper.tone(color) === "dark" ? "light" : "dark";
  },
  /**
   * inkColorForFill
   *
   * @param textStyle {String}  primary|secondary|hint|disabled|icon
   * @param fillColor {String} a valid qooxdoo/CSS rgb color string
   * @return {String} a CSS rgba color string
   */
  inkColorForFill: function (textStyle, fillColor) {
    var textColor = {
      dark: {
        primary: "rgba(0,0,0,0.87)",
        secondary: "rgba(0,0,0,0.54)",
        hint: "rgba(0,0,0,0.38)",
        disabled: "rgba(0,0,0,0,0.38)",
        icon: "rgba(0,0,0,0.38)"
      },
      light: {
        primary: "#fff",
        secondary: "rgba(255,255,255,0.7)",
        hint: "rgba(255,255,255,0.5)",
        disabled: "rgba(255,255,255,0.5)",
        icon: "rgba(255,255,255,0.5)"
      }
    };
    var contrastTone = helper.contrastTone(fillColor);
    return textColor[contrastTone][textStyle];
  },

  // helpers
  onX: function (key) {
    var baseColor = key.split('-')[2];
    return helper.contrastTone(baseColor) === "dark" ? "#000000" : "#ffffff"
  },
  // helpers
  xState: function (key) {
    var d = key.split('-');
    var color = d[0];
    var state = d[1];
    switch (state) {
      case 'focussed':
        return qx.util.ColorUtil.scale(color, {
          lightness: 10,
          saturation: 10
        });
      case 'hovered':
        return qx.util.ColorUtil.scale(color, {
          lightness: 10
        });
      case 'disabled':
        return qx.util.ColorUtil.scale(color, {
          lightness: -10,
          saturation: - 70
        });
      case 'selected':
          return qx.util.ColorUtil.scale(color, {
            lightness: 30
          });
      case 'selected_disabled':
          return qx.util.ColorUtil.scale(color, {
            lightness: 30,
            saturation: - 70
          });
      default:
        return color;
    }
  },

  textXonY: function (key) {
    var splitKey = key.split('-');
    var textStyle = splitKey[1];
    var fillColor = splitKey[3];
    return helper.inkColorForFill(textStyle, fillColor)
  },

  setAlpha: function(key) {
    var splitKey = key.split('-');
    var baseColor = splitKey[0];
    var alphaPercent = splitKey[2];
    var rgba = qx.util.ColorUtil.stringToRgb(baseColor);
    rgba[3] = alphaPercent/100;
    return qx.util.ColorUtil.rgbToRgbString(rgba);
  }
};

qx.Theme.define("qx.theme.tangible.ColorEngine", {
  colors: {
    // actual implementations must supply these 4 colors
    // at least
    
    //"primary": "#6200ee",
    //"secondary": "#018786",
    //"surface": "#ffffff",
    //"error": "#b00020",
    // automatic colors
    
    
    "text-on-primary": helper.onX,
    "text-on-secondary": helper.onX,
    "text-on-surface": helper.onX,
    "text-on-error": helper.onX,
    "primary-hovered": helper.xState,
    "primary-disabled": helper.xState,
    "primary-focussed": helper.xState,
    "primary-selected": helper.xState,
    "primary-selected_disabled": helper.xState,
    "error-focussed": helper.xState,

    // alpha colors
    "primary-alpha-5": helper.setAlpha,
    "primary-alpha-10": helper.setAlpha,
    "primary-alpha-30": helper.setAlpha,
    "secondary-alpha-5": helper.setAlpha,
    "primary-disabled-alpha-20": helper.setAlpha,


    // Text-primary on "surface" background
    "text-primary-on-surface": helper.textXonY,
    "text-hint-on-surface": helper.textXonY,
    "text-disabled-on-surface": helper.textXonY,
    "text-icon-on-surface": helper.textXonY,
    "text-disabled-on-primary": helper.textXonY,
    "text-icon-on-primary": helper.textXonY,

    // the following colors are used directly in table code
    "table-header-cell": "surface",

    "table-row-background-focused-selected": "primary-alpha-10",
    "table-row-background-focused": "primary-alpha-5",
    "table-row-background-selected": "secondary-alpha-5",
    "table-row-background-even": "surface",
    "table-row-background-odd": "surface",
    // foreground
    "table-row-selected": "text-primary-on-surface",
    "table-row": "text-primary-on-surface",
    // table grid color
    "table-row-line": "text-hint-on-surface",
    "table-column-line": "transparent",

    // used in the widget-browser-app
    "text-disabled": "text-disabled-on-surface",

    // used in progressive code
    "progressive-table-header": "table-header-cell",
    "progressive-table-row-background-even": "primary-alpha-5",
    "progressive-table-row-background-odd": "surface",
    "progressive-progressbar-background": "surface",
    "progressive-progressbar-indicator-done": "primary",
    "progressive-progressbar-indicator-undone": "surface",
    "progressive-progressbar-percent-background": "surface",
    "progressive-progressbar-percent-text": "text-primary-on-surface"
  }
});
