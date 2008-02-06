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
 * The qooxdoo big font theme.
 */
qx.Theme.define("qx.theme.classic.font.Big",
{
  title : "Classic Big",
  extend : qx.theme.classic.font.Default,

  fonts :
  {
    "default" :
    {
      size : 13,
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ]
    },

    "bold" :
    {
      size : 13,
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ],
      bold : true
    },

    "large" :
    {
      size : 16,
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ]
    }
  }
});
