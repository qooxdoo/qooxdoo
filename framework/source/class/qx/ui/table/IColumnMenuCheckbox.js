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
 * Interface for a checkbox menu item.
 */
qx.Interface.define("qx.ui.table.IColumnMenuCheckbox",
{
  properties :
  {
    checked : { }
  },

  events :
  {
    changeChecked : "qx.event.type.Data"
  }
});
