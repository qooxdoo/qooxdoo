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
 * The modern font theme.
 */
qx.Theme.define("qx.theme.modern.Font",
{
  title : "Modern",

  fonts :
  {
    "default" :
    {
      size : 11,
      lineHeight : 1.3,
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ]
    },

    "bold" :
    {
      size : 11,
      lineHeight : 1.3,
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ],
      bold : true
    },

    "medium" :
    {
      size : 10,
      lineHeight : 1.3,      
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ]
    },

    "large" :
    {
      size : 16,
      lineHeight : 1.3,      
      family : [ "Lucida Grande", "Tahoma", "Verdana", "Bitstream Vera Sans", "Liberation Sans" ]
    },

    "monospace" :
    {
      size : 11,
      lineHeight : 1.3,      
      family : ["Consolas", "Bitstream Vera Sans Mono", "Courier New", "monospace"]
    }
  }
});
