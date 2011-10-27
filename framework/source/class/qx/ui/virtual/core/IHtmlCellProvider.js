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
 * A HTML cell provider provides the {@link qx.ui.virtual.layer.HtmlCell}
 * with HTML fragments to render the cells.
 */
qx.Interface.define("qx.ui.virtual.core.IHtmlCellProvider",
{
  members :
  {
    /**
     * Returns all relevant properties of the cell:
     * <ul>
     * <li>classes (String): Space separated class names</li>
     * <li>style (String): CSS styles</li>
     * <li>attributes (String): Space separated attributes</li>
     * <li>content (String): HTML fragment of the innerHTML of the cell</li>
     * <li>insets (Array): insets (padding + border) of the cell as
     * two-dimensional array.</li>
     * </ul>
     *
     * @param row {Integer} The cell's row index.
     * @param column {Integer} The cell's column index.
     *
     * @return {Map} Cell properties (see above.)
     */
    getCellProperties : function(row, column) {}
  }
});