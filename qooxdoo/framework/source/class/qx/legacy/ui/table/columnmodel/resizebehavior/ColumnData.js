/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(table)

************************************************************************ */

/**
 * All of the resizing information about a column.  This is just here for
 * backward compatibility.  New applications should directly instantiate
 * {@link qx.legacy.ui.util.column.Data}.
 */
qx.Class.define("qx.legacy.ui.table.columnmodel.resizebehavior.ColumnData",
{
  extend : qx.legacy.ui.util.column.Data
});
