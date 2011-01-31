/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/**
 * The classic qooxdoo font theme.
 */
qx.Theme.define("qx.theme.simple.Font",
{
  fonts :
  {
    "default" :
    {
      size : 13,
      family : ["arial", "sans-serif"]
    },

    "bold" :
    {
      size : 13,
      family : ["arial", "sans-serif"],
      bold : true
    },

    "small" :
    {
      size : 11,
      family : ["arial", "sans-serif"]
    },

    "monospace" :
    {
      size : 11,
      family : [ "DejaVu Sans Mono", "Courier New", "monospace" ]
    }
  }
});
