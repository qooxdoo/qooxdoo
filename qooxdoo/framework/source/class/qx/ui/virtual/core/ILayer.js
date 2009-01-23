/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Interface.define("qx.ui.virtual.core.ILayer",
{
  members :
  {
    fullUpdate : function(cells, rowSizes, columnSizes) {
      this.assertArgumentsCount(arguments, 3, 3);      
    },
    
    updateScrollPosition : function(cells, lastCells, rowSizes, columnSizes) {
      this.assertArgumentsCount(arguments, 4, 4);
    }
  }
});
