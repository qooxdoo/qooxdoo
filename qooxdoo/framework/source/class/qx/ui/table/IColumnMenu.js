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
 * Interface for creating the column visibility menu
 */
qx.Interface.define("qx.ui.table.IColumnMenu",
{
  properties :
  {
    menu : { }
  },

  members :
  {
    factory : function(item, text)
    {
      return true;
    },
    
    empty : function()
    {
      return true;
    }
  }
});
