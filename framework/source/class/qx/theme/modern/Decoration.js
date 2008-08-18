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

************************************************************************* */

/* ************************************************************************

#asset(qx/decoration/Modern/*)

************************************************************************ */

/**
 * The modern decoration theme.
 */
qx.Theme.define("qx.theme.modern.Decoration",
{
  title : "Modern",
  resource : "qx/decoration/Modern",

  decorations :
  {
    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "frame" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "frame"
      }
    },

    "border" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : "#666",
        style : "solid",

        backgroundColor : "white"
      }
    },

    "focus" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-focused"
      }
    },

    "selected" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundImage  : "decoration/selection.png",
        backgroundRepeat : "scale"
      }
    },







    /*
    ---------------------------------------------------------------------------
      POPUP
    ---------------------------------------------------------------------------
    */

    "popup" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        backgroundColor : "background-light",

        width : 1,
        color : "#666",
        style : "solid"
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
        colorLeft : "frame"
      }
    },

    "separator-vertical" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "frame"
      }
    },




    /*
    ---------------------------------------------------------------------------
      SHADOWS
    ---------------------------------------------------------------------------
    */

    "window-shadow" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/shadow/shadow.png",
        insets    : [ 4, 8, 8, 4 ]
      }
    },

    "popup-shadow" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/shadow/shadow-small.png",
        insets    : [ 0, 3, 3, 0 ]
      }
    },




    /*
    ---------------------------------------------------------------------------
      PANE
    ---------------------------------------------------------------------------
    */

    "pane" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/pane/pane.png",
        insets    : [0, 2, 3, 0]
      }
    },




    /*
    ---------------------------------------------------------------------------
      GROUPBOX
    ---------------------------------------------------------------------------
    */

    "groupbox-frame" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/groupbox/groupbox.png"
      }
    },




    /*
    ---------------------------------------------------------------------------
      SCROLLBAR
    ---------------------------------------------------------------------------
    */

    "scrollbar-horizontal" :
    {
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-horizontal.png",
        backgroundRepeat : "repeat-x"
      }
    },

    "scrollbar-vertical" :
    {
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-vertical.png",
        backgroundRepeat : "repeat-y"
      }
    },

    "scrollbar-button-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-horizontal.png",
        backgroundRepeat : "scale",
        outerColor : "#4d4d4d",
        innerColor : "#e1e1e1"
      }
    },

    "scrollbar-button-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-button-bg-vertical.png",
        backgroundRepeat : "scale",
        outerColor : "#4d4d4d",
        innerColor : "#e1e1e1"
      }
    },

    "slider-knob" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/slider-knob-background.png",
        backgroundRepeat : "scale",
        outerColor : "#4d4d4d",
        innerColor : "#e1e1e1"
      }
    },

    "slider-knob-pressed-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-pressed-vertical.png",
        backgroundRepeat : "scale",
        outerColor : "#192433",
        innerColor : "#e9f5ff"
      }
    },

    "slider-knob-pressed-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-pressed-horizontal.png",
        backgroundRepeat : "scale",
        outerColor : "#192433",
        innerColor : "#e9f5ff"
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
        outerColor : "border",
        innerColor : "white",
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
        outerColor : "border",
        innerColor : "border-focused",
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
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        backgroundImage : "decoration/toolbar/toolbar-gradient.png",
        backgroundRepeat : "scale"
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
      decorator : qx.ui.decoration.Uniform,

      style :
      {
        backgroundImage  : "decoration/toolbar/toolbar-part.png",
        backgroundRepeat : "repeat-y"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

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






    /*
    ---------------------------------------------------------------------------
      TOOLTIP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : "#666",
        style : "solid",

        backgroundColor : "#ffffdd"
      }
    },





    /*
    ---------------------------------------------------------------------------
      IFRAME
    ---------------------------------------------------------------------------
    */

    "iframe" :
    {
      decorator : qx.ui.decoration.Double,

      style :
      {
        backgroundColor : "white",

        width : 1,
        innerWidth : 1,

        color : "border",
        innerColor : "white",

        style : "solid"
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

    "window-border" :
    {
      decorator: qx.ui.decoration.Single,

      style :
      {
        backgroundColor : "#f6f6f6",

        width : 1,
        color : "#00204D",

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
        color : "frame",
        style : "solid"
      }
    },

   "table-statusbar" :
   {
     decorator : qx.ui.decoration.Single,

     style :
     {
       widthTop : 1,
       colorTop : "frame",
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
       colorBottom : "frame",
       style       : "solid"
     }
   },

   "table-header-cell" :
   {
     decorator :  qx.ui.decoration.Double,

     style :
     {
       backgroundImage  : "decoration/table/header-cell.png",
       backgroundRepeat : "scale",

       widthRight : 1,
       colorRight : "#F2F2F2",

       innerWidthRight : 1,
       innerColorRight : "#A6A6A6",

       style      : "solid"
     }
   },

   "table-header-cell-hovered" :
   {
     decorator :  qx.ui.decoration.Double,

     style :
     {
       backgroundImage  : "decoration/table/header-cell.png",
       backgroundRepeat : "scale",

       widthRight : 1,
       colorRight : "#F2F2F2",

       innerWidthRight : 1,
       innerColorRight : "#A6A6A6",

       widthBottom : 1,
       colorBottom : "white",

       style      : "solid"
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
       colorBottom : "frame",
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
        color       : "frame",
        style       : "solid"
      }
   },

   "progressive-table-header-cell" :
   {
     decorator :  qx.ui.decoration.Double,

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
       color : "frame",
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
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "date-chooser" :
    {
      decorator : qx.ui.decoration.Double,

      style :
      {
        width      : 1,
        innerWidth : 1,

        color      : "border-dark",
        innerColor : "white"
      }
    }
  }
});
