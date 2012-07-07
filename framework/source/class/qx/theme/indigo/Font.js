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

/* ************************************************************************

#asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.woff)
#asset(qx/decoration/Indigo/font/JosefinSlab-SemiBold.ttf)

************************************************************************* */


/**
 * The simple qooxdoo font theme.
 */
qx.Theme.define("qx.theme.indigo.Font",
{
  fonts :
  {
    "default" :
    {
      size : 12,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      color: "font",
      lineHeight: 1.8
    },

    "bold" :
    {
      size : 12,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      bold : true,
      color: "font",
      lineHeight: 1.8
    },

    "headline" :
    {
      size : 22,
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
    },

    "small" :
    {
      size : 11,
      family : ["Lucida Grande", "DejaVu Sans", "Verdana", "sans-serif"],
      color: "font",
      lineHeight: 1.8
    },

    "monospace" :
    {
      size : 11,
      family : [ "DejaVu Sans Mono", "Courier New", "monospace" ],
      color: "font",
      lineHeight: 1.8
    }
  }
});