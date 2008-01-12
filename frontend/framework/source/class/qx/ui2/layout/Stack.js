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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A stack layout. Arranges children on top of each other where only
 * one is visible.
 */
qx.Class.define("qx.ui2.layout.Stack",
{
  extend : qx.ui2.layout.Abstract,

  properties :
  {
    selected :
    {
      check : "qx.ui2.core.Widget",
      nullable : true
    }
  },

  members :
  {



  }
});
