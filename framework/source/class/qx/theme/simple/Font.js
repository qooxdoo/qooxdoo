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
 * The simple qooxdoo font theme.
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

    "headline" :
    {
      size : 24,
      family : ["sans-serif", "arial"]
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
