/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      style :
      {
        radius: [3, 3, 0, 0],
        color: "window-border",
        widthBottom: 1
      }
    },

    "window-caption-active" : {
      style :
      {
        radius: [3, 3, 0, 0],
        color: "highlight",
        widthBottom: 3
      }
    },


    "white-box" :
    {
      style :
      {
        width: 1,
        color: "white-box-border",
        backgroundColor : "white"
      }
    },

    "statusbar" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-main",
        styleTop : "solid"
      }
    },


    "app-header" : {
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