/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/**
 * The qooxdoo serif font theme.
 */
qx.Theme.define("qx.theme.classic.font.Serif",
{
  title : "Classic Serif",
  extend : qx.theme.classic.font.Default,

  fonts :
  {
    "default" :
    {
      size : 11,
      family : [ "Georgia", "Times New Roman", "serif" ]
    },

    "bold" :
    {
      size : 11,
      family : [ "Georgia", "Times New Roman", "serif" ],
      bold : true
    },

    "large" :
    {
      size : 13,
      family : [ "Georgia", "Times New Roman", "serif" ]
    }
  }
});
