/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Alexander Steitz (aback)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************


************************************************************************ */

/**
 * The modern decoration theme.
 *
 * @asset(qx/decoration/Modern/toolbar/toolbar-part.gif)
 */
qx.Theme.define("qx.theme.modern.Decoration",
{
  aliases : {
    decoration : "qx/decoration/Modern"
  },

  decorations :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "main" :
    {
      style :
      {
        width : 1,
        color : "border-main"
      }
    },

    "selected" :
    {
      style :
      {
        startColorPosition : 0,
        endColorPosition : 100,
        startColor : "selected-start",
        endColor : "selected-end"
      }
    },

    "dragover" :
    {
      style :
      {
        bottom: [2, "solid", "border-dragover"]
      }
    },

    "pane" : {
      style : {
        width: 1,
        color: "tabview-background",
        radius : 3,
        shadowColor : "shadow",
        shadowBlurRadius : 2,
        shadowLength : 0,
        gradientStart : ["pane-start", 0],
        gradientEnd : ["pane-end", 100]
      }
    },

    "group" :
    {
      style : {
        backgroundColor : "group-background",
        radius : 4,
        color : "group-border",
        width: 1
      }
    },


    "keyboard-focus" :
    {
      style :
      {
        width : 1,
        color : "keyboard-focus",
        style : "dotted"
      }
    },

    /*
    ---------------------------------------------------------------------------
      RADIO BUTTON
    ---------------------------------------------------------------------------
    */
    "radiobutton" : {
      style : {
        backgroundColor : "radiobutton-background",
        radius : 5,
        width: 1,
        innerWidth : 2,
        color : "checkbox-border",
        innerColor : "radiobutton-background",
        shadowLength : 0,
        shadowBlurRadius : 0,
        shadowColor : "checkbox-focus"
      }
    },

    "radiobutton-checked" : {
      include : "radiobutton",
      style : {
        backgroundColor : "radiobutton-checked"
      }
    },

    "radiobutton-checked-focused" : {
      include  : "radiobutton-checked",
      style : {
        shadowBlurRadius : 4
      }
    },

    "radiobutton-checked-hovered" : {
      include : "radiobutton-checked",
      style : {
        innerColor : "checkbox-hovered"
      }
    },

    "radiobutton-focused" : {
      include : "radiobutton",
      style : {
        shadowBlurRadius : 4
      }
    },

    "radiobutton-hovered" : {
      include : "radiobutton",
      style : {
        backgroundColor : "checkbox-hovered",
        innerColor : "checkbox-hovered"
      }
    },

    "radiobutton-disabled" : {
      include : "radiobutton",
      style : {
        innerColor : "radiobutton-disabled",
        backgroundColor : "radiobutton-disabled",
        color : "checkbox-disabled-border"
      }
    },

    "radiobutton-checked-disabled" : {
      include : "radiobutton-disabled",
      style : {
        backgroundColor : "radiobutton-checked-disabled"
      }
    },

    "radiobutton-invalid" : {
      include : "radiobutton",
      style : {
        color : "invalid"
      }
    },

    "radiobutton-checked-invalid" : {
      include : "radiobutton-checked",
      style : {
        color : "invalid"
      }
    },

    "radiobutton-checked-focused-invalid" : {
      include  : "radiobutton-checked-focused",
      style : {
        color : "invalid",
        shadowColor : "invalid"
      }
    },

    "radiobutton-checked-hovered-invalid" : {
      include : "radiobutton-checked-hovered",
      style : {
        color : "invalid",
        innerColor : "radiobutton-hovered-invalid"
      }
    },

    "radiobutton-focused-invalid" : {
      include : "radiobutton-focused",
      style : {
        color : "invalid",
        shadowColor : "invalid"
      }
    },

    "radiobutton-hovered-invalid" : {
      include : "radiobutton-hovered",
      style : {
        color : "invalid",
        innerColor : "radiobutton-hovered-invalid",
        backgroundColor : "radiobutton-hovered-invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      SEPARATOR
    ---------------------------------------------------------------------------
    */

    "separator-horizontal" :
    {
      style :
      {
        widthLeft : 1,
        colorLeft : "border-separator"
      }
    },

    "separator-vertical" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-separator"
      }
    },



    /*
    ---------------------------------------------------------------------------
      TOOLTIP
    ---------------------------------------------------------------------------
    */
    "tooltip-error" :
    {
      style : {
        backgroundColor : "tooltip-error",
        radius : 4,
        shadowColor : "shadow",
        shadowBlurRadius : 2,
        shadowLength : 1
      }
    },


    /*
    ---------------------------------------------------------------------------
      POPUP
    ---------------------------------------------------------------------------
    */

    "popup" :
    {
      style :
      {
        width : 1,
        color : "border-main",
        shadowColor : "shadow",
        shadowBlurRadius : 3,
        shadowLength : 1
      }
    },



    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */
    "scrollbar-horizontal" :
    {
      style : {
        gradientStart : ["scrollbar-start", 0],
        gradientEnd : ["scrollbar-end", 100]
      }
    },

    "scrollbar-vertical" : {
      include : "scrollbar-horizontal",
      style : {
        orientation : "horizontal"
      }
    },

    "scrollbar-slider-horizontal" :
    {
      style : {
        gradientStart : ["scrollbar-slider-start", 0],
        gradientEnd : ["scrollbar-slider-end", 100],

        color : "border-main",
        width: 1,
        radius: 3
      }
    },

    "scrollbar-slider-vertical" :
    {
      include : "scrollbar-slider-horizontal",
      style : {
        orientation : "horizontal"
      }
    },

    "scrollbar-slider-horizontal-disabled" :
    {
      include : "scrollbar-slider-horizontal",
      style : {
        color : "button-border-disabled"
      }
    },

    "scrollbar-slider-vertical-disabled" :
    {
      include : "scrollbar-slider-vertical",
      style : {
        color : "button-border-disabled"
      }
    },



    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */
    "button" :
    {
      style :
      {
        radius: 3,
        color: "border-button",
        width: 1,
        startColor: "button-start",
        endColor: "button-end",
        startColorPosition: 35,
        endColorPosition: 100
      }
    },

    "button-disabled" :
    {
      include : "button",
      style : {
        color : "button-border-disabled",
        startColor: "button-disabled-start",
        endColor: "button-disabled-end"
      }
    },

    "button-hovered" :
    {
      include : "button",
      style : {
        startColor : "button-hovered-start",
        endColor : "button-hovered-end"
      }
    },

    "button-checked" :
    {
      include : "button",
      style : {
        endColor: "button-start",
        startColor: "button-end"
      }
    },

    "button-pressed" :
    {
      include : "button",
      style : {
        endColor : "button-hovered-start",
        startColor : "button-hovered-end"
      }
    },

    "button-focused" : {
      style :
      {
        radius: 3,
        color: "border-button",
        width: 1,
        innerColor: "button-focused",
        innerWidth: 2,
        startColor: "button-start",
        endColor: "button-end",
        startColorPosition: 30,
        endColorPosition: 100
      }
    },

    "button-checked-focused" : {
      include : "button-focused",
      style : {
        endColor: "button-start",
        startColor: "button-end"
      }
    },

    // invalid
    "button-invalid" : {
      include : "button",
      style : {
        color: "border-invalid"
      }
    },

    "button-disabled-invalid" :
    {
      include : "button-disabled",
      style : {
        color : "border-invalid"
      }
    },

    "button-hovered-invalid" :
    {
      include : "button-hovered",
      style : {
        color : "border-invalid"
      }
    },

    "button-checked-invalid" :
    {
      include : "button-checked",
      style : {
        color : "border-invalid"
      }
    },

    "button-pressed-invalid" :
    {
      include : "button-pressed",
      style : {
        color : "border-invalid"
      }
    },

    "button-focused-invalid" : {
      include : "button-focused",
      style : {
        color : "border-invalid"
      }
    },

    "button-checked-focused-invalid" : {
      include : "button-checked-focused",
      style : {
        color : "border-invalid"
      }
    },


    /*
    ---------------------------------------------------------------------------
      CHECK BOX
    ---------------------------------------------------------------------------
    */
    "checkbox" : {
      style : {
        width: 1,
        color: "checkbox-border",
        innerWidth : 1,
        innerColor : "checkbox-inner",

        backgroundColor: "checkbox-end",

        shadowLength : 0,
        shadowBlurRadius : 0,
        shadowColor : "checkbox-focus"
      }
    },

    "checkbox-hovered" : {
      include : "checkbox",
      style : {
        innerColor : "checkbox-hovered-inner",
        backgroundColor: "checkbox-hovered"
      }
    },

    "checkbox-focused" : {
      include : "checkbox",
      style : {
        shadowBlurRadius : 4
      }
    },

    "checkbox-disabled" : {
      include : "checkbox",
      style : {
        color : "checkbox-disabled-border",
        innerColor : "checkbox-disabled-inner",
        backgroundColor : "checkbox-disabled-end"
      }
    },

    "checkbox-invalid" : {
      include : "checkbox",
      style : {
        color : "invalid"
      }
    },

    "checkbox-hovered-invalid" : {
      include : "checkbox-hovered",
      style : {
        color : "invalid",
        innerColor : "checkbox-hovered-inner-invalid",
        backgroundColor: "checkbox-hovered-invalid"
      }
    },

    "checkbox-focused-invalid" : {
      include : "checkbox-focused",
      style : {
        color : "invalid",
        shadowColor : "invalid"
      }
    },



    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */

    "input" :
    {
      style :
      {
        color : "border-input",
        innerColor : "border-inner-input",
        innerWidth: 1,
        width : 1,
        backgroundColor : "background-light",
        startColor : "input-start",
        endColor : "input-end",
        startColorPosition : 0,
        endColorPosition : 12,
        colorPositionUnit : "px"
      }
    },

    "border-invalid" : {
      include : "input",
      style : {
        color : "border-invalid"
      }
    },

    "input-focused" : {
      include : "input",
      style : {
        startColor : "input-focused-start",
        innerColor : "input-focused-end",
        endColorPosition : 4
      }
    },

    "input-focused-invalid" : {
      include : "input-focused",
      style : {
        innerColor : "input-focused-inner-invalid",
        color : "border-invalid"
      }
    },

    "input-disabled" : {
      include : "input",
      style : {
        color: "input-border-disabled"
      }
    },



    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : {
        startColorPosition : 40,
        endColorPosition : 60,
        startColor : "toolbar-start",
        endColor : "toolbar-end"
      }
    },

    "toolbar-button-hovered" :
    {
      style :
      {
        color : "border-toolbar-button-outer",
        width: 1,
        innerWidth: 1,
        innerColor : "border-toolbar-border-inner",
        radius : 2,
        gradientStart : ["button-start", 30],
        gradientEnd : ["button-end", 100]
      }
    },

    "toolbar-button-checked" :
    {
      include : "toolbar-button-hovered",

      style :
      {
        gradientStart : ["button-end", 30],
        gradientEnd : ["button-start", 100]
      }
    },

    "toolbar-separator" :
    {
      style :
      {
        widthLeft : 1,
        widthRight : 1,

        colorLeft : "border-toolbar-separator-left",
        colorRight : "border-toolbar-separator-right",

        styleLeft : "solid",
        styleRight : "solid"
      }
    },

    "toolbar-part" :
    {
      style :
      {
        backgroundImage  : "decoration/toolbar/toolbar-part.gif",
        backgroundRepeat : "repeat-y"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tabview-pane" :
    {
      style : {
        width: 1,
        color: "window-border",
        radius : 3,
        gradientStart : ["tabview-start", 90],
        gradientEnd : ["tabview-end", 100]
      }
    },

    "tabview-page-button-top-active" :
    {
      style : {
        radius : [3, 3, 0, 0],
        width: [1, 1, 0, 1],
        color: "tabview-background",
        backgroundColor : "tabview-start",
        shadowLength: 1,
        shadowColor: "shadow",
        shadowBlurRadius: 2
      }
    },

    "tabview-page-button-top-inactive" :
    {
      style : {
        radius : [3, 3, 0, 0],
        color: "tabview-inactive",
        colorBottom : "tabview-background",
        width: 1,
        gradientStart : ["tabview-inactive-start", 0],
        gradientEnd : ["tabview-inactive-end", 100]
      }
    },

    "tabview-page-button-bottom-active" :
    {
      include : "tabview-page-button-top-active",

      style : {
        radius : [0, 0, 3, 3],
        width: [0, 1, 1, 1],
        backgroundColor : "tabview-inactive-start",
        shadowLength: 0,
        shadowBlurRadius: 0
      }
    },

    "tabview-page-button-bottom-inactive" :
    {
      include : "tabview-page-button-top-inactive",

      style : {
        radius : [0, 0, 3, 3],
        width: [0, 1, 1, 1],
        colorBottom : "tabview-inactive",
        colorTop : "tabview-background"
      }
    },

    "tabview-page-button-left-active" :
    {
      include : "tabview-page-button-top-active",

      style : {
        radius : [3, 0, 0, 3],
        width: [1, 0, 1, 1],
        shadowLength: 0,
        shadowBlurRadius: 0
      }
    },

    "tabview-page-button-left-inactive" :
    {
      include : "tabview-page-button-top-inactive",

      style : {
        radius : [3, 0, 0, 3],
        width: [1, 0, 1, 1],
        colorBottom : "tabview-inactive",
        colorRight : "tabview-background"
      }
    },

    "tabview-page-button-right-active" :
    {
      include : "tabview-page-button-top-active",

      style : {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0],
        shadowLength: 0,
        shadowBlurRadius: 0
      }
    },

    "tabview-page-button-right-inactive" :
    {
      include : "tabview-page-button-top-inactive",

      style : {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0],
        colorBottom : "tabview-inactive",
        colorLeft : "tabview-background"
      }
    },





    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      style :
      {
        backgroundColor : "background-pane",

        width : 3,
        color : "background-splitpane",
        style : "solid"
      }
    },





    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */
    "window" :
    {
      style : {
        radius : [5, 5, 0, 0],
        shadowBlurRadius : 4,
        shadowLength : 2,
        shadowColor : "shadow"
      }
    },

    "window-incl-statusbar" : {
       include : "window",
       style : {
         radius : [5, 5, 5, 5]
       }
    },

    "window-resize-frame" :
    {
      style : {
        radius : [5, 5, 0, 0],
        width : 1,
        color : "border-main"
      }
    },

    "window-resize-frame-incl-statusbar" :
    {
       include : "window-resize-frame",
       style : {
         radius : [5, 5, 5, 5]
       }
    },

    "window-captionbar-active" :
    {
      style : {
        width : 1,
        color : "window-border",
        colorBottom : "window-border-caption",
        radius : [5, 5, 0, 0],
        gradientStart : ["window-caption-active-start", 30],
        gradientEnd : ["window-caption-active-end", 70]
      }
    },

    "window-captionbar-inactive" :
    {
      include : "window-captionbar-active",
      style : {
        gradientStart : ["window-caption-inactive-start", 30],
        gradientEnd : ["window-caption-inactive-end", 70]
      }
    },

    "window-statusbar" :
    {
      style : {
        backgroundColor : "window-statusbar-background",
        width: [0, 1, 1, 1],
        color: "window-border",
        radius : [0, 0, 5, 5]
      }
    },

    "window-pane" :
    {
      style :
      {
        backgroundColor : "background-pane",
        width : 1,
        color : "window-border",
        widthTop : 0
      }
    },



    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" :
    {
      style :
      {
        width : 1,
        color : "border-main",
        style : "solid"
      }
    },

    "table-statusbar" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-main",
        style    : "solid"
      }
    },

    "table-scroller-header" :
    {
      style :
      {
        gradientStart : ["table-header-start", 10],
        gradientEnd : ["table-header-end", 90],

        widthBottom : 1,
        colorBottom : "border-main"
      }
    },

    "table-header-cell" :
    {
      style :
      {
        widthRight : 1,
        colorRight : "border-separator",
        styleRight : "solid"
      }
    },


    "table-header-cell-hovered" :
    {
      style :
      {
        widthRight : 1,
        colorRight : "border-separator",
        styleRight : "solid",

        widthBottom : 1,
        colorBottom : "table-header-hovered",
        styleBottom : "solid"
      }
    },

    "table-scroller-focus-indicator" :
    {
      style :
      {
        width : 2,
        color : "table-focus-indicator",
        style : "solid"
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE
    ---------------------------------------------------------------------------
    */

    "progressive-table-header" :
    {
       style :
       {
         width       : 1,
         color       : "border-main",
         style       : "solid"
       }
    },

    "progressive-table-header-cell" :
    {
      style :
      {
        gradientStart : ["table-header-start", 10],
        gradientEnd : ["table-header-end", 90],

        widthRight : 1,
        colorRight : "progressive-table-header-border-right"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      style : {
        gradientStart : ["menu-start", 0],
        gradientEnd : ["menu-end", 100],
        shadowColor : "shadow",
        shadowBlurRadius : 2,
        shadowLength : 1,
        width : 1,
        color : "border-main"
      }
    },

    "menu-separator" :
    {
      style :
      {
        widthTop    : 1,
        colorTop    : "menu-separator-top",

        widthBottom : 1,
        colorBottom : "menu-separator-bottom"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    "menubar" :
    {
      style :
      {
        gradientStart : ["menubar-start", 0],
        gradientEnd : ["menu-end", 100],

        width : 1,
        color : "border-separator"
      }
    },

    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header":
    {
      style :
      {
        gradientStart : ["#243B58", 0],
        gradientEnd : ["#1D2D45", 100]
      }

    },

    /*
    ---------------------------------------------------------------------------
      PROGRESSBAR
    ---------------------------------------------------------------------------
    */

    "progressbar" :
    {

      style:
      {
        width: 1,
        color: "border-input"
      }
    },

    /*
    ---------------------------------------------------------------------------
      VIRTUAL WIDGETS
    ---------------------------------------------------------------------------
    */

    "group-item" :
    {
      style :
      {
        startColorPosition : 0,
        endColorPosition : 100,
        startColor : "groupitem-start",
        endColor : "groupitem-end"
      }
    }
  }
});
