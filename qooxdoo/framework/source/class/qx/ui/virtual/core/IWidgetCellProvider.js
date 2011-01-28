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
 * EXPERIMENTAL!
 *
 * A widget cell provider provides the {@link qx.ui.virtual.layer.WidgetCell}
 * with configured widgets to render the cells and pools/releases unused
 * cell widgets.
 */
qx.Interface.define("qx.ui.virtual.core.IWidgetCellProvider",
{
  members :
  {
    /**
     * This method returns the configured cell for the given cell. The return
     * value may be <code>null</code> to indicate that the cell should be empty.
     *
     * @param row {Integer} The cell's row index.
     * @param column {Integer} The cell's column index.
     * @return {qx.ui.core.LayoutItem} The configured widget for the given cell.
     */
    getCellWidget : function(row, column) {},

    /**
     * Release the given cell widget. Either pool or destroy the widget.
     *
     * @param widget {qx.ui.core.LayoutItem} The cell widget to pool.
     */
    poolCellWidget : function(widget) {}
  }
});