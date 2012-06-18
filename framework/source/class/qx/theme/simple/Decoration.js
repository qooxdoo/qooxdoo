/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/**
 * The simple qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.simple.Decoration",
{
  aliases : {
    decoration : "qx/decoration/Simple"
  },

  decorations :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "border-blue" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 4,
        color : "background-selected"
      }
    },


    "main" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-main"
      }
    },

    "main-dark" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "button-border"
      }
    },


    "popup" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "window-border",
        shadowLength : 2,
        shadowBlurRadius : 5,
        shadowColor : "shadow"
      }
    },


    "dragover" :
    {
      decorator : qx.ui.decoration.Single,

      style : {
        bottom: [2, "solid", "dark-blue"]
      }
    },



    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button-box" :
    {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 3,
        width : 1,
        color : "button-border",
        gradientStart : ["button-box-bright", 40],
        gradientEnd : ["button-box-dark", 70],
        backgroundColor : "button-box-bright"
      }
    },

    "button-box-pressed" :
    {
      include : "button-box",

      style :
      {
        gradientStart : ["button-box-bright-pressed", 40],
        gradientEnd : ["button-box-dark-pressed", 70],
        backgroundColor : "button-box-bright-pressed"
      }
    },

    "button-box-pressed-hovered" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "button-box-hovered" :
    {
      include : "button-box",

      style :
      {
        color : "button-border-hovered"
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON INVALID
    ---------------------------------------------------------------------------
    */
    "button-box-invalid" :
    {
      include : "button-box",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-pressed-invalid" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "invalid"
      }
    },

    "button-box-hovered-invalid" : {include: "button-box-invalid"},

    "button-box-pressed-hovered-invalid" : {include: "button-box-pressed-invalid"},


    /*
    ---------------------------------------------------------------------------
      BUTTON FOCUSED
    ---------------------------------------------------------------------------
    */
    "button-box-focused" :
    {
      include : "button-box",

      style :
      {
        color : "background-selected"
      }
    },

    "button-box-pressed-focused" :
    {
      include : "button-box-pressed",

      style :
      {
        color : "background-selected"
      }
    },

    "button-box-hovered-focused" : {include: "button-box-focused"},

    "button-box-pressed-hovered-focused" : {include: "button-box-pressed-focused"},


    /*
    ---------------------------------------------------------------------------
      BUTTON RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-pressed-hovered-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-hovered-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },

    "button-box-focused-right" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [0, 3, 3, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BORDERLESS RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-right-borderless" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-right-borderless" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-right-borderless" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-hovered-right-borderless" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-top-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-top-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-top-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },

    "button-box-hovered-top-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 3, 0, 0],
        width: [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BOTOM RIGHT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-right" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-pressed-bottom-right" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-pressed-hovered-bottom-right" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },

    "button-box-hovered-bottom-right" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 0, 3, 0],
        width : [0, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON BOTOM LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-bottom-left" :
    {
      include : "button-box",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-bottom-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-bottom-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },

    "button-box-hovered-bottom-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [0, 0, 0, 3],
        width : [0, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON TOP LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-top-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-top-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-pressed-hovered-top-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },

    "button-box-hovered-top-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 0],
        width : [1, 0, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON MIDDLE
    ---------------------------------------------------------------------------
    */
    "button-box-middle" :
    {
      include : "button-box",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-middle" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-middle" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-middle" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      BUTTON LEFT
    ---------------------------------------------------------------------------
    */
    "button-box-left" :
    {
      include : "button-box",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-left" :
    {
      include : "button-box-pressed",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-pressed-hovered-left" :
    {
      include : "button-box-pressed-hovered",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-hovered-left" :
    {
      include : "button-box-hovered",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "button-box-focused-left" :
    {
      include : "button-box-focused",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      SEPARATOR
    ---------------------------------------------------------------------------
    */

    "separator-horizontal" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "border-separator"
      }
    },

    "separator-vertical" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-separator"
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL KNOB
    ---------------------------------------------------------------------------
    */
    "scroll-knob" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 3,
        width : 1,
        color : "button-border",
        backgroundColor : "scrollbar-bright"
      }
    },

    "scroll-knob-pressed" :
    {
      include : "scroll-knob",

      style :
      {
        backgroundColor : "scrollbar-dark"
      }
    },

    "scroll-knob-hovered" :
    {
      include: "scroll-knob",

      style :
      {
        color : "button-border-hovered"
      }
    },

    "scroll-knob-pressed-hovered" :
    {
      include: "scroll-knob-pressed",

      style :
      {
        color : "button-border-hovered"
      }
    },

    /*
    ---------------------------------------------------------------------------
      HOVER BUTTON
    ---------------------------------------------------------------------------
    */
    "button-hover" :
    {
      decorator : [
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        backgroundColor : "button",
        radius : 3
      }
    },


    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */
    "window" :
    {
      decorator: [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "window-border",
        innerWidth : 4,
        innerColor: "window-border-inner",
        shadowLength : 1,
        shadowBlurRadius : 3,
        shadowColor : "shadow",
        backgroundColor : "background"
      }
    },

    "window-active" :
    {
      include : "window",

      style :
      {
        shadowLength : 2,
        shadowBlurRadius : 5
      }
    },


    "window-caption" : {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : [0, 0, 2, 0],
        color : "window-border-inner"
      }
    },


    /*
    ---------------------------------------------------------------------------
      GROUP BOX
    ---------------------------------------------------------------------------
    */
    "white-box" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "white-box-border",
        shadowBlurRadius : 2,
        shadowColor : "#999999",
        radius: 7,
        backgroundColor : "white"
      }
    },


    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */
    "inset" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-light", "border-light", "border-light" ]
      }
    },

    "focused-inset" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 2,
        color : "background-selected"
      }
    },

    "border-invalid" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 2,
        color : "invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      LIST ITEM
    ---------------------------------------------------------------------------
    */

    "lead-item" :
    {
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        style : "dotted",
        color : "border-lead"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOL TIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBoxShadow
      ],

      style :
      {
        width : 1,
        color : "tooltip-text",
        shadowLength : 1,
        shadowBlurRadius : 2,
        shadowColor : "shadow"
      }
    },


    "tooltip-error" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style : {
        radius: 5,
        backgroundColor: "invalid"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar-separator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "button-border"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */
    "menu-separator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop: 1,
        colorTop : "background-selected"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */
    "menubar-button-hovered" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "border-main",
        radius : 3,
        backgroundColor : "white"
      }
    },


    "menubar-button-pressed" :
    {
      include : "menubar-button-hovered",

      style :
      {
        radius : [3, 3, 0, 0],
        width : [1, 1, 0, 1]
      }
    },


    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-date-pane" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop: 1,
        colorTop : "gray",
        style : "solid"
      }
    },


    "datechooser-weekday" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom: 1,
        colorBottom : "gray",
        style : "solid"
      }
    },

    "datechooser-week" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight: 1,
        colorRight : "gray",
        style : "solid"
      }
    },

    "datechooser-week-header" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom : 1,
        colorBottom : "gray",
        widthRight: 1,
        colorRight : "gray",
        style : "solid"
      }
    },





    /*
    ---------------------------------------------------------------------------
      TAB VIEW
    ---------------------------------------------------------------------------
    */

    "tabview-page-button-top" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : [1, 1, 0, 1],
        backgroundColor: "background",
        color : "border-main",
        radius : [3, 3, 0, 0]
      }
    },

    "tabview-page-button-bottom" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 0, 3, 3],
        width : [0, 1, 1, 1]
      }
    },

    "tabview-page-button-left" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [3, 0, 0, 3],
        width : [1, 0, 1, 1]
      }
    },

    "tabview-page-button-right" : {
      include : "tabview-page-button-top",

      style :
      {
        radius : [0, 3, 3, 0],
        width : [1, 1, 1, 0]
      }
    },


    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "statusbar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "background-selected",
        styleTop : "solid"
      }
    },

    "table-scroller-focus-indicator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 2,
        color : "table-focus-indicator",
        style : "solid"
      }
    },

    "table-header" :
    {
      include : "button-box",

      style :
      {
        radius : 0,
        width : [1, 0, 1, 0]
      }
    },

    "table-header-column-button" :
    {
      include : "table-header",
      style : {
        width : 1,
        color : "button-border"
      }
    },

    "table-header-cell" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        color : "button-border"
      }
    },

    "table-header-cell-first" :
    {
      include : "table-header-cell",
      style : {
        widthLeft : 1
      }
    },


    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */

    "progressbar" :
    {
      decorator: qx.ui.decoration.Single,

      style:
      {
        backgroundColor: "#FFF",
        width: 1,
        color: "border-separator"
      }
    },



    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        radius : 10,
        width : 1,
        color : "button-border",
        innerColor: "background",
        innerWidth: 2
      }
    },

    "radiobutton-focused" :
    {
      include : "radiobutton",
      style :
      {
        color : "background-selected"
      }
    },

    "radiobutton-invalid" :
    {
      include : "radiobutton",
      style :
      {
        color : "invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */

    "checkbox" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "button-border"
      }
    },

    "checkbox-focused" :
    {
      include : "checkbox",
      style :
      {
        color : "background-selected"
      }
    },

    "checkbox-invalid" :
    {
      include : "checkbox",
      style :
      {
        color : "invalid"
      }
    }
  }
});
