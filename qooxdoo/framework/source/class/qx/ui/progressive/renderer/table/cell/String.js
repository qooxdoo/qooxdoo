/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * Table Cell Renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.String",
{
  extend     : qx.ui.progressive.renderer.table.cell.Abstract,


  /**
   */
  construct : function()
  {
    this.base(arguments);
  },


  members :
  {
    // overridden
    _getContentHtml : function(cellInfo)
    {
      return qx.bom.String.escape(cellInfo.cellData);
    }
  }
});
