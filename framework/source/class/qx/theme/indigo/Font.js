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
qx.Theme.define("qx.theme.indigo.Font",
{
  fonts :
  {
    "default" :
    {
      size : 12,
      family : ["Lucida Grande", "Verdana", "sans-serif"],
      color: "#262626",
      lineHeight: 1.8
    },

    "bold" :
    {
      size : 12,
      family : ["Lucida Grande", "Verdana", "sans-serif"],
      bold : true,
      color: "#262626",
      lineHeight: 1.8
    },

    "headline" :
    {
      size : 18,
      family : ["Lucida Grande", "Verdana", "sans-serif"]
    },

    "small" :
    {
      size : 11,
      family : ["Lucida Grande", "Verdana", "sans-serif"],
      color: "#262626",
      lineHeight: 1.8
    },

    "monospace" :
    {
      size : 11,
      family : [ "DejaVu Sans Mono", "Courier New", "monospace" ],
      color: "#262626",
      lineHeight: 1.8
    }
  }
});