/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2009 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A menu item.
 */
qx.Class.define("qx.ui.table.columnmenu.grid.MenuItem",
{
  extend     : qx.ui.form.ListItem,

  properties :
  {
    visible :
    {
      check : "Boolean",
      init  : true,
      event : "changeVisible"
    }
  },

  construct : function(menu, text, colNum)
  {
    this.base(arguments, text, null, colNum);
  }
});
