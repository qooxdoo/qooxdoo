/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * A HTML cell provider provides the {@link qx.ui.virtual.layer.HtmlCell}
 * with HTML fragments to render the cells.
 */
qx.Interface.define("qx.ui.virtual.cell.ICell", {
  members: {
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
     * @param data {var} Data needed for the cell to render.
     * @param states {Map} The states set on the cell (e.g. <i>selected</i>,
     * <i>focused</i>, <i>editable</i>).
     *
     * @return {Map} Cell properties (see above.)
     */
    getCellProperties(data, states) {}
  }
});
