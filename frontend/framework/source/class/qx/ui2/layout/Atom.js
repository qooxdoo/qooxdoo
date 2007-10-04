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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A atom layout. Used to place an Image/Flash and label in relation
 * to each other. Useful to create buttons etc.
 */
qx.Class.define("qx.ui2.layout.Atom",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    gap :
    {
      check : "Integer",
      init : 4
    },

    iconPosition :
    {
      check : [ "left", "top", "right", "bottom" ],
      init : "left"
    }
  },

  members :
  {



  }
});
