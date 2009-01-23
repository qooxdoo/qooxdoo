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

/**
 * A layer is responsible to render one aspect of a virtual pane. The pane tells
 * each layer to render/update a specific window of the virtual grid.
 */
qx.Interface.define("qx.ui.virtual.core.ILayer",
{
  members :
  {
    /**
     * Do a complete update of the layer. All cached data should be discarded.
     * This method is called e.g. after changes to the grid geometry
     * (row/column sizes, row/column count, ...). 
     * @param cells {Object} The window of cells to display. This is a Map with
     *    the keys <code>firstRow</code>, <code>lastRow</code>,
     *    <code>firstColumn</code> and <code>lastColumn</code>.
     * @param rowSizes {Integer[]} Array of heights for each row to display
     * @param columnSizes {Integer[]} Array of widths for each column to display
     */
    fullUpdate : function(cells, rowSizes, columnSizes) {
      this.assertArgumentsCount(arguments, 3, 3);      
    },
    
    /**
     * Update the layer to display a different window of the virtual grid.
     * This method is called if the pane is scrolled, resized or cells
     * are prefetched. The implementation can assume that no other grid
     * data has been changes since the last "fullUpdate" of "updateLayerWindow"
     * call.
     * 
     * @param cells {Object} The window of cells to display. This is a Map with
     *    the keys <code>firstRow</code>, <code>lastRow</code>,
     *    <code>firstColumn</code> and <code>lastColumn</code>.
     * @param lastCells {Object} This window of cells the layer displays
     *    currently. The format of this value is the same as the "cells" 
     *    argument. This information can be used to update only those parts
     *    of the layer, which have been changed.
     * @param rowSizes {Integer[]} Array of heights for each row to display
     * @param columnSizes {Integer[]} Array of widths for each column to display
     */
    updateLayerWindow : function(cells, lastCells, rowSizes, columnSizes) {
      this.assertArgumentsCount(arguments, 4, 4);
    }
  }
});
