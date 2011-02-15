/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Alexander Back (aback)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************

#asset(qx/decoration/Modern/*)

************************************************************************ */

/**
 * The modern decoration theme.
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
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-main"
      }
    },

    "selected" :
    {
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage  : "decoration/selection.png",
        backgroundRepeat : "scale"
      }
    },

    "selected-css" :
    {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient
      ],

      style :
      {
        startColorPosition : 0,
        endColorPosition : 100,
        startColor : "#004DAD",
        endColor : "#00368A"
      }
    },

    "selected-dragover" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/selection.png",
        backgroundRepeat : "scale",
        bottom: [2, "solid", "#33508D"]
      }
    },

    "dragover" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        bottom: [2, "solid", "#33508D"]
      }
    },

    "pane" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/pane/pane.png",
        insets    : [0, 2, 3, 0]
      }
    },

    "group" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/groupbox/groupbox.png"
      }
    },

    "border-invalid" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "invalid",
        innerColor : "white",
        innerOpacity : 0.5,
        backgroundImage : "decoration/form/input.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },


    "keyboard-focus" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : "black",
        style : "dotted"
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
      TOOLTIP
    ---------------------------------------------------------------------------
    */

    "tooltip-error" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/tooltip-error.png",
        insets    : [ 2, 5, 5, 2 ]
      }
    },

    "tooltip-error-css" :
    {
      decorator : [
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MBoxShadow
      ],

      style : {
        backgroundColor : "#C82C2C",
        radius : 4,
        shadowColor : "#999999",
        shadowBlurRadius : 2,
        shadowLength : 1
      }
    },


    "tooltip-error-arrow" :
    {
      decorator: qx.ui.decoration.Background,

      style: {
        backgroundImage: "decoration/form/tooltip-error-arrow.png",
        backgroundPositionY: "center",
        backgroundRepeat: "no-repeat",
        insets: [0, 0, 0, 10]
      }
    },


    /*
    ---------------------------------------------------------------------------
      SHADOWS
    ---------------------------------------------------------------------------
    */

    "shadow-window" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/shadow/shadow.png",
        insets    : [ 4, 8, 8, 4 ]
      }
    },

    "shadow-popup" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/shadow/shadow-small.png",
        insets    : [ 0, 3, 3, 0 ]
      }
    },

    "popup-css" :
    {
      decorator: [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width : 1,
        color : "border-main",
        shadowColor : "#999999",
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
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-horizontal.png",
        backgroundRepeat : "repeat-x"
      }
    },

    "scrollbar-vertical" :
    {
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-vertical.png",
        backgroundRepeat : "repeat-y"
      }
    },

    "scrollbar-slider-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-horizontal.png",
        backgroundRepeat : "scale",
        outerColor : "border-main",
        innerColor : "white",
        innerOpacity : 0.5
      }
    },

    "scrollbar-slider-horizontal-disabled" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-horizontal.png",
        backgroundRepeat : "scale",
        outerColor : "border-disabled",
        innerColor : "white",
        innerOpacity : 0.3
      }
    },

    "scrollbar-slider-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-vertical.png",
        backgroundRepeat : "scale",
        outerColor : "border-main",
        innerColor : "white",
        innerOpacity : 0.5
      }
    },

    "scrollbar-slider-vertical-disabled" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-vertical.png",
        backgroundRepeat : "scale",
        outerColor : "border-disabled",
        innerColor : "white",
        innerOpacity : 0.3
      }
    },




    /*
    ---------------------------------------------------------------------------
      PLAIN CSS BUTTON
    ---------------------------------------------------------------------------
    */
    "button-css" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        radius: 3,
        color: "#464646",
        width: 1,
        startColor: "#F0F0F0",
        endColor: "#9F9F9F",
        startColorPosition: 30,
        endColorPosition: 100
      }
    },

    "button-disabled-css" : 
    {
      include : "button-css",
      style : {
        color : "#959595",
        startColor: "#F4F4F4",
        endColor: "#BABABA"
      }
    },
    
    "button-hovered-css" : 
    {
      include : "button-css",
      style : {
        startColor : "#F0F9FE",
        endColor : "#8EB8D6"
      }
    },

    "button-checked-css" : 
    {
      include : "button-css",
      style : {
        endColor: "#F0F0F0",
        startColor: "#9F9F9F"
      }
    },

    "button-pressed-css" : 
    {
      include : "button-css",
      style : {
        endColor : "#F0F9FE",
        startColor : "#8EB8D6"
      }
    },
    
    "button-focused-css" : {
      decorator : [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        radius: 3,
        color: "#464646",
        width: 1,
        innerColor: "#83BAEA",
        innerWidth: 2,
        startColor: "#F0F0F0",
        endColor: "#9F9F9F",
        startColorPosition: 30,
        endColorPosition: 100
      }
    },
    
    "button-checked-focused-css" : {
      include : "button-focused-css",
      style : {
        endColor: "#F0F0F0",
        startColor: "#9F9F9F"
      }
    },
    
    // invalid
    "button-invalid-css" : {
      include : "button-css",
      style : {
        color: "#930000"
      }
    },
    
    "button-disabled-invalid-css" : 
    {
      include : "button-disabled-css",
      style : {
        color : "#930000"
      }
    },
    
    "button-hovered-invalid-css" : 
    {
      include : "button-hovered-css",
      style : {
        color : "#930000"
      }
    },

    "button-checked-invalid-css" : 
    {
      include : "button-checked-css",
      style : {
        color : "#930000"
      }
    },

    "button-pressed-invalid-css" : 
    {
      include : "button-pressed-css",
      style : {
        color : "#930000"
      }
    },
    
    "button-focused-invalid-css" : {
      include : "button-focused-css",
      style : {
        color : "#930000"
      }
    },
    
    "button-checked-focused-invalid-css" : {
      include : "button-checked-focused-css",
      style : {
        color : "#930000"
      }
    },    
    
    
    
    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button.png",
        insets    : 2
      }
    },

    "button-disabled" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-disabled.png",
        insets    : 2
      }
    },

    "button-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-focused.png",
        insets    : 2
      }
    },

    "button-hovered" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-hovered.png",
        insets    : 2
      }
    },

    "button-pressed" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-pressed.png",
        insets    : 2
      }
    },

    "button-checked" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-checked.png",
        insets    : 2
      }
    },

    "button-checked-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/form/button-checked-focused.png",
        insets    : 2
      }
    },

    "button-invalid-shadow" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "invalid",
        innerColor : "border-focused-invalid",
        insets: [1]
      }
    },



    /*
    ---------------------------------------------------------------------------
      CHECKBOX
    ---------------------------------------------------------------------------
    */

    "checkbox-invalid-shadow" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "invalid",
        innerColor : "border-focused-invalid",
        insets: [0]
      }
    },



    /*
    ---------------------------------------------------------------------------
      PLAIN CSS TEXT FIELD
    ---------------------------------------------------------------------------
    */

    "input-css" :
    {
      decorator : [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        color : "border-input",
        innerColor : "white",
        innerWidth: 1,
        width : 1,
        backgroundColor : "background-light",
        startColor : "#F0F0F0",
        endColor : "#FBFCFB",
        startColorPosition : 0,
        endColorPosition : 20
      }
    },
    
    "border-invalid-css" : {
      include : "input-css",
      style : {
        color : "#930000"
      }
    },

    "input-focused-css" : {
      include : "input-css",
      style : {
        startColor : "#D7E7F4",
        innerColor : "#5CB0FD"
      }
    },
    
    "input-focused-invalid-css" : {
      include : "input-focused-css",
      style : {
        innerColor : "#FF6B78",
        color : "#930000"
      }
    },

    "input-disabled-css" : {
      include : "input-css",
      style : {
        color: "#9B9B9B"
      }
    },



    /*
    ---------------------------------------------------------------------------
      TEXT FIELD
    ---------------------------------------------------------------------------
    */

    "input" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "border-input",
        innerColor : "white",
        innerOpacity : 0.5,
        backgroundImage : "decoration/form/input.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },

    "input-focused" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "border-input",
        innerColor : "border-focused",
        backgroundImage : "decoration/form/input-focused.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },

    "input-focused-invalid" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "invalid",
        innerColor : "border-focused-invalid",
        backgroundImage : "decoration/form/input-focused.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light",
        insets: [2]
      }
    },


    "input-disabled" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "border-disabled",
        innerColor : "white",
        innerOpacity : 0.5,
        backgroundImage : "decoration/form/input.png",
        backgroundRepeat : "repeat-x",
        backgroundColor : "background-light"
      }
    },





    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage : "decoration/toolbar/toolbar-gradient.png",
        backgroundRepeat : "scale"
      }
    },
    
    "toolbar-css" : 
    {
      decorator : [qx.ui.decoration.MLinearBackgroundGradient],
      style : {
        startColorPosition : 40,
        endColorPosition : 60,
        startColor : "#EFEFEF",
        endColor : "#DDDDDD"
      }
    },

    "toolbar-button-hovered" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "#b6b6b6",
        innerColor : "#f8f8f8",
        backgroundImage : "decoration/form/button-c.png",
        backgroundRepeat : "scale"
      }
    },

    "toolbar-button-checked" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor : "#b6b6b6",
        innerColor : "#f8f8f8",
        backgroundImage : "decoration/form/button-checked-c.png",
        backgroundRepeat : "scale"
      }
    },
    
    "toolbar-button-hovered-css" :
    {
      decorator : [
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        color : "#b6b6b6",
        width: 1,
        innerWidth: 1,
        innerColor : "#f8f8f8",
        radius : 2,    
        gradientStart : ["#F0F0F0", 30],
        gradientEnd : ["#AFAFAF", 100]
      }
    },

    "toolbar-button-checked-css" :
    {
      include : "toolbar-button-hovered-css",

      style :
      {
        gradientStart : ["#AFAFAF", 30],
        gradientEnd : ["#F0F0F0", 100]
      }
    },    

    "toolbar-separator" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        widthRight : 1,

        colorLeft : "#b8b8b8",
        colorRight : "#f4f4f4",

        styleLeft : "solid",
        styleRight : "solid"
      }
    },

    "toolbar-part" :
    {
      decorator : qx.ui.decoration.Background,

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
      decorator : qx.ui.decoration.Grid,

      style :
      {
        baseImage : "decoration/tabview/tabview-pane.png",
        insets : [ 4, 6, 7, 4 ]
      }
    },
    
    "tabview-pane-css" : 
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MSingleBorder
      ],
      
      style : {
        width: 1,
        color: "#00204D",
        radius : 3,
        gradientStart : ["#FCFCFC", 90],
        gradientEnd : ["#EEEEEE", 100]
      }
    },

    "tabview-page-button-top-active" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-top-active.png"
      }
    },   

    "tabview-page-button-top-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-top-inactive.png"
      }
    },

    "tabview-page-button-bottom-active" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-bottom-active.png"
      }
    },

    "tabview-page-button-bottom-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-bottom-inactive.png"
      }
    },

    "tabview-page-button-left-active" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-left-active.png"
      }
    },

    "tabview-page-button-left-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-left-inactive.png"
      }
    },

    "tabview-page-button-right-active" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-right-active.png"
      }
    },

    "tabview-page-button-right-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/tabview/tab-button-right-inactive.png"
      }
    },


    // CSS TABVIEW BUTTONS
    "tabview-page-button-top-active-css" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBoxShadow
      ],

      style : {
        radius : [3, 3, 0, 0],
        width: [1, 1, 0, 1],
        color: "#07125A",
        backgroundColor : "#FCFCFC",
        shadowLength: 1,
        shadowColor: "#8B8B8B",
        shadowBlurRadius: 2        
      }
    },

    "tabview-page-button-top-inactive-css" :
    {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MLinearBackgroundGradient
      ],

      style : {
        radius : [3, 3, 0, 0],
        color: "#777D8D",
        colorBottom : "#07125A",
        width: 1,
        gradientStart : ["#EAEAEA", 0],
        gradientEnd : ["#CECECE", 100]
      }
    },

    "tabview-page-button-bottom-active-css" :
    {
      include : "tabview-page-button-top-active-css",

      style : {
        radius : [0, 0, 3, 3],
        width: [0, 1, 1, 1],
        backgroundColor : "#EAEAEA"
      }
    },

    "tabview-page-button-bottom-inactive-css" :
    {
      include : "tabview-page-button-top-inactive-css",

      style : {
        radius : [0, 0, 3, 3],
        width: [0, 1, 1, 1],
        colorBottom : "#777D8D",
        colorTop : "#07125A"
      }
    },

    "tabview-page-button-left-active-css" :
    {
      include : "tabview-page-button-top-active-css",

      style : {
        radius : [3, 0, 0, 3],
        width: [1, 0, 1, 1],
        shadowLength: 0,
        shadowBlurRadius: 0
      }
    },

    "tabview-page-button-left-inactive-css" :
    {
      include : "tabview-page-button-top-inactive-css",

      style : {
        radius : [3, 0, 0, 3],
        width: [1, 0, 1, 1],
        colorBottom : "#777D8D",
        colorRight : "#07125A"
      }
    },

    "tabview-page-button-right-active-css" :
    {
      include : "tabview-page-button-top-active-css",

      style : {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0],
        shadowLength: 0,
        shadowBlurRadius: 0
      }
    },

    "tabview-page-button-right-inactive-css" :
    {
      include : "tabview-page-button-top-inactive-css",

      style : {
        radius : [0, 3, 3, 0],
        width: [1, 1, 1, 0],
        colorBottom : "#777D8D",
        colorLeft : "#07125A"
      }
    },    
    
    
    


    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      decorator : qx.ui.decoration.Uniform,

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
      decorator: qx.ui.decoration.Single,

      style :
      {
        backgroundColor : "background-pane",

        width : 1,
        color : "border-main",
        widthTop : 0
      }
    },

    "window-captionbar-active" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/window/captionbar-active.png"
      }
    },

    "window-captionbar-inactive" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/window/captionbar-inactive.png"
      }
    },

    "window-statusbar" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/window/statusbar.png"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : "border-main",
        style : "solid"
      }
    },

    "table-statusbar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-main",
        style    : "solid"
      }
    },

    "table-scroller-header" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/table/header-cell.png",
        backgroundRepeat : "scale",

        widthBottom : 1,
        colorBottom : "border-main",
        style       : "solid"
      }
    },

    "table-header-cell" :
    {
      decorator :  qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        colorRight : "border-separator",
        styleRight : "solid"
      }
    },


    "table-header-cell-hovered" :
    {
      decorator :  qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        colorRight : "border-separator",
        styleRight : "solid",

        widthBottom : 1,
        colorBottom : "white",
        styleBottom : "solid"
      }
    },

    "table-column-button" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/table/header-cell.png",
        backgroundRepeat : "scale",

        widthBottom : 1,
        colorBottom : "border-main",
        style       : "solid"
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





    /*
    ---------------------------------------------------------------------------
      PROGRESSIVE
    ---------------------------------------------------------------------------
    */

    "progressive-table-header" :
    {
       decorator : qx.ui.decoration.Single,

       style :
       {
         width       : 1,
         color       : "border-main",
         style       : "solid"
       }
    },

    "progressive-table-header-cell" :
    {
      decorator :  qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/table/header-cell.png",
        backgroundRepeat : "scale",

        widthRight : 1,
        colorRight : "#F2F2F2",
        style      : "solid"
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/menu/background.png",
        backgroundRepeat : "scale",

        width : 1,
        color : "border-main",
        style : "solid"
      }
    },

    "menu-separator" :
    {
      decorator :  qx.ui.decoration.Single,

      style :
      {
        widthTop    : 1,
        colorTop    : "#C5C5C5",

        widthBottom : 1,
        colorBottom : "#FAFAFA"
      }
    },


    /*
    ---------------------------------------------------------------------------
      MENU BAR
    ---------------------------------------------------------------------------
    */

    "menubar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/menu/bar-background.png",
        backgroundRepeat : "scale",

        width : 1,
        color : "border-separator",
        style : "solid"
      }
    },

    /*
    ---------------------------------------------------------------------------
      APPLICATION
    ---------------------------------------------------------------------------
    */

    "app-header":
    {
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage : "decoration/app-header.png",
        backgroundRepeat : "scale"
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
      decorator : qx.ui.decoration.Background,

      style :
      {
        backgroundImage  : "decoration/group-item.png",
        backgroundRepeat : "scale"
      }
    },
    
    "group-item-css" :
    {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient
      ],

      style :
      {
        startColorPosition : 0,
        endColorPosition : 100,
        startColor : "#A7A7A7",
        endColor : "#949494"
      }
    }    
  }
});
