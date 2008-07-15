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
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/* ************************************************************************

#asset(qx/decoration/Classic/*)

************************************************************************ */

/**
 * The classic qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.classic.Decoration",
{
  title : "Classic",
  resource : "qx/decoration/Classic",

  decorations :
  {
    "black" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "black"
      }
    },

    "white" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "white"
      }
    },

    "dark-shadow" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-dark-shadow"
      }
    },

    "light-shadow" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-light-shadow"
      }
    },

    "light" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-light"
      }
    },

    "dark" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "border-dark"
      }
    },

    "inset" :
    {
      decorator : qx.ui.decoration.Double,

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
      decorator : qx.ui.decoration.Double,

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
      decorator : qx.ui.decoration.Double,

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
      decorator : qx.ui.decoration.Double,

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
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
      }
    },

    "outset-thin" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "line-left" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "border-dark-shadow"
      }
    },

    "line-right" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        colorRight : "border-dark-shadow"
      }
    },

    "line-top" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow"
      }
    },

    "line-bottom" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom : 1,
        colorBottom : "border-dark-shadow"
      }
    },

    "divider-vertical" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow"
      }
    },

    "divider-horizontal" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthLeft : 1,
        colorLeft : "border-dark-shadow"
      }
    },

    "focused-inset" :
    {
      decorator : qx.ui.decoration.Double,

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
      decorator : qx.ui.decoration.Double,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-focused-light-shadow", "border-focused-dark", "border-focused-dark", "border-focused-light-shadow" ],
        innerColor : [ "border-focused-light", "border-focused-dark-shadow", "border-focused-dark-shadow", "border-focused-light" ]
      }
    },

    "lead-item" :
    {
      decorator : qx.ui.decoration.Double,

      style :
      {
        width : 1,
        style : "dotted",
        color : "border-lead"
      }
    },

    "tabview" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        style : "solid",
        color : "border-dark-shadow"
      }
    },

    "tooltip" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "tooltip-text"
      }
    },

    "toolbar-part-handle" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        width : 1,
        backgroundColor : "background",
        style : "solid",

        colorTop    : "#ffffff",
        colorLeft   : "#ffffff",
        colorRight  : "#a7a6aa",
        colorBottom : "#a7a6aa"
      }
    }

  }
});
