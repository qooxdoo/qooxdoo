/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/**
 * The custom font theme for the playground.
 */
qx.Theme.define("playground.theme.Font",
{
  extend : qx.theme.indigo.Font,

  fonts :
  {
    "header" :
    {
      size : (qx.core.Environment.get("os.name") == "win" &&
        (qx.core.Environment.get("os.version") == "7" ||
        qx.core.Environment.get("os.version") == "vista")) ? 16 : 15,
      lineHeight : 1.4,
      family : qx.core.Environment.get("os.name") == "osx" ?
        [ "Lucida Grande" ] :
        ((qx.core.Environment.get("os.name") == "win" &&
          (qx.core.Environment.get("os.version") == "7" ||
          qx.core.Environment.get("os.version") == "vista"))) ?
        [ "Segoe UI", "Candara" ] :
        [ "Tahoma", "Liberation Sans", "Arial", "sans-serif" ]
    },


    "CodePen" :
    {
      size : 40,
      family : ["serif"],
      sources:
      [
        {
          family : "JosefinSlab",
          source: [
            "qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff",
            "qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf"
          ]
        }
      ]
    }
  }
});