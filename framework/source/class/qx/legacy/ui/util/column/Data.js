/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(column)

************************************************************************ */

/**
 * All of the resizing information about a column.  This is the class which
 * {@link qx.legacy.ui.util.column.Widths} contains in its array of column data.
 */
qx.Class.define("qx.legacy.ui.util.column.Data",
{
  extend : qx.legacy.ui.core.Widget,


  construct : function()
  {
    this.base(arguments);

    // Assume equal flex width for all columns
    this.setWidth("1*");
  }
});
