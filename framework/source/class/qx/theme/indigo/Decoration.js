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
 * The indigo qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.indigo.Decoration",
{
  extend : qx.theme.simple.Decoration,

  aliases : {
    decoration : "qx/decoration/Simple"
  },

  decorations :
  {
    "window" :
    {
      decorator: [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBoxShadow,
        qx.ui.decoration.MBackgroundColor,
        qx.ui.decoration.MBorderRadius
      ],

      style :
      {
        width : 1,
        color : "window-border",
        shadowLength : 1,
        shadowBlurRadius : 3,
        shadowColor : "shadow",
        backgroundColor : "background",
        radius: 3
      }
    },


    "window-caption" : {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder
      ],

      style :
      {
        radius: [3, 3, 0, 0],
        color: "window-border",
        widthBottom: 1
      }
    },

    "window-caption-active" : {
      decorator : [
        qx.ui.decoration.MBorderRadius,
        qx.ui.decoration.MSingleBorder
      ],

      style :
      {
        radius: [3, 3, 0, 0],
        color: "highlight",
        widthBottom: 3
      }
    },


    "white-box" :
    {
      decorator : [
        qx.ui.decoration.MSingleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        width: 1,
        color: "white-box-border",
        backgroundColor : "white"
      }
    },

    "statusbar" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-main",
        styleTop : "solid"
      }
    },


    "app-header" : {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        innerWidthBottom : 1,
        innerColorBottom: "highlight-shade",
        widthBottom: 9,
        colorBottom: "highlight",

        gradientStart : ["#505154", 0],
        gradientEnd : ["#323335", 100],

        backgroundColor : "#323335"
      }
    }
  }
});