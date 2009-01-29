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
 * A HTML cell provider provides the {@link qx.ui.virtual.layer.HtmlCell}
 * with HTML fragments to render the cells.
 */
qx.Interface.define("qx.ui.virtual.core.IHtmlCellProvider",
{
  members :
  {
    /**
     * This method returns an HTML string to render the given table cell.
     * This method may return an empty string to indicate that the cell should
     * be empty. 
     * 
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param left {Integer} The cell's left position
     * @param top {Integer} The cell's top position
     * @param width {Integer} The cell's width
     * @param height {Integer} The cell's height
     * @return {String|null} The HTML string to render the cell
     */
    getCellHtml : function(row, column, left, top, width, height) {}  
  }
});