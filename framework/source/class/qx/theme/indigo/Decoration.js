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
qx.Theme.define("qx.theme.indigo.Decoration",
{
  extend : qx.theme.simple.Decoration,

  aliases : {
    decoration : "qx/decoration/Indigo"
  },

  decorations :
  {
    "app-header" : {
      decorator : [
        qx.ui.decoration.MLinearBackgroundGradient,
        qx.ui.decoration.MDoubleBorder,
        qx.ui.decoration.MBackgroundColor
      ],

      style :
      {
        innerWidthBottom : 1,
        innerColorBottom: "#5583D0",
        widthBottom: 9,
        colorBottom: "#3D72C9",

        gradientStart : ["#505154", 0],
        gradientEnd : ["#323335", 100],

        backgroundColor : "#323335"
      }
    }
  }
});