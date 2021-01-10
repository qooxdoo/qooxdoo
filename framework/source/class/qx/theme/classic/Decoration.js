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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)
   * Martin Wittemann (martinwittemann)

************************************************************************* */

/* ************************************************************************


************************************************************************* */

/**
 * The classic qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.classic.Decoration",
{
  aliases : {
    decoration : "qx/decoration/Classic"
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
        color : "border-dark"
      }
    },


    "keyboard-focus" :
    {
      style :
      {
        width : 1,
        color : "black",
        style : "dotted"
      }
    },



    /*
    ---------------------------------------------------------------------------
      THREE DIMENSIONAL
    ---------------------------------------------------------------------------
    */

    "inset" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
      }
    },

    "outset" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "groove" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "ridge" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],
        innerColor : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
      }
    },

    "inset-thin" :
    {
      style :
      {
        width : 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
      }
    },

    "outset-thin" :
    {
      style :
      {
        width : 1,
        color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "focused-inset" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-focused-dark-shadow", "border-focused-light", "border-focused-light", "border-focused-dark-shadow" ],
        innerColor : [ "border-focused-dark", "border-focused-light-shadow", "border-focused-light-shadow", "border-focused-dark" ]
      }
    },

    "focused-outset" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-focused-light-shadow", "border-focused-dark", "border-focused-dark", "border-focused-light-shadow" ],
        innerColor : [ "border-focused-light", "border-focused-dark-shadow", "border-focused-dark-shadow", "border-focused-light" ]
      }
    },

    "border-invalid" :
    {
      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : "invalid"
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
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      include: "outset",
      style : {
        shadowLength : 1,
        shadowBlurRadius : 2,
        shadowColor : "shadow"
      }
    },


    /*
    ---------------------------------------------------------------------------
      LIST ITEM
    ---------------------------------------------------------------------------
    */

    "lead-item" :
    {
      style :
      {
        width : 1,
        style : "dotted",
        color : "border-lead"
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOL TIP / POPUP
    ---------------------------------------------------------------------------
    */

    "tooltip" :
    {
      style :
      {
        width : 1,
        color : "tooltip-text",
        shadowLength : 1,
        shadowBlurRadius : 5,
        shadowColor : "shadow"
      }
    },


    "tooltip-error" :
    {
      style : {
        width : 1,
        color : "tooltip-text",
        shadowLength : 1,
        shadowBlurRadius : 5,
        shadowColor : "shadow"
      }
    },


    "popup" :
    {
      include : "main",

      style : {
        shadowLength : 2,
        shadowBlurRadius : 2,
        shadowColor : "shadow"
      }
    },


    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar-separator" :
    {
      style :
      {
        widthLeft : 1,
        colorLeft : "border-dark-shadow"
      }
    },

    "toolbar-part-handle" :
    {
      style :
      {
        width : 1,
        style : "solid",

        colorTop    : "white",
        colorLeft   : "white",
        colorRight  : "border-dark-shadow",
        colorBottom : "border-dark-shadow"
      }
    },





    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      include : "outset",
      style :
      {
        shadowLength : 1,
        shadowBlurRadius : 3,
        shadowColor : "shadow"
      }
    },


    "menu-separator" :
    {
      style :
      {
        widthTop: 1,
        widthBottom: 1,
        colorTop : "border-dark",
        colorBottom : "border-light"
      }
    },





    /*
    ---------------------------------------------------------------------------
      DATE CHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-date-pane" :
    {
      style :
      {
        widthTop: 1,
        colorTop : "gray",
        style : "solid"
      }
    },


    "datechooser-weekday" :
    {
      style :
      {
        widthBottom: 1,
        colorBottom : "gray",
        style : "solid"
      }
    },

    "datechooser-week" :
    {
      style :
      {
        widthRight: 1,
        colorRight : "gray",
        style : "solid"
      }
    },

    "datechooser-week-header" :
    {
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
      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],

        innerWidth : 1,
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],

        widthBottom : 0,
        innerWidthBottom : 0
      }
    },

    "tabview-page-button-bottom" :
    {
      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],

        innerWidth : 1,
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],

        widthTop : 0,
        innerWidthTop : 0
      }
    },

    "tabview-page-button-left" :
    {
      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],

        innerWidth : 1,
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],

        widthRight : 0,
        innerWidthRight : 0
      }
    },

    "tabview-page-button-right" :
    {
      style :
      {
        width : 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],

        innerWidth : 1,
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],

        widthLeft : 0,
        innerWidthLeft : 0
      }
    },





    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table-statusbar" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow",
        styleTop : "solid"
      }
    },

    "table-scroller-header" :
    {
      style :
      {
        widthBottom : 1,
        colorBottom : "table-header-border",
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

    "table-header-cell" :
    {
      style :
      {
        widthRight : 1,
        colorRight : "table-header-border",
        styleRight : "solid"
      }
    },

    "table-header-cell-hovered" :
    {
      style :
      {
        widthRight : 1,
        colorRight : "table-header-border",
        styleRight : "solid",

        widthBottom : 2,
        colorBottom : "effect",
        styleBottom : "solid"
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
        backgroundColor: "#FFF",
        width: 1,
        color: "border-separator"
      }
    }
  }
});
