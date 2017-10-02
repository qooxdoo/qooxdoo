/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * A cell renderer for header cells.
 */
qx.Interface.define("qx.ui.table.IHeaderRenderer",
{

  members :
  {
    /**
     * Creates a header cell.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>col (int): the model index of the column.</li>
     * <li>xPos (int): the x position of the column in the table pane.</li>
     * <li>name (string): the name of the column.</li>
     * <li>editable (boolean): whether the column is editable.</li>
     * <li>sorted (boolean): whether the column is sorted.</li>
     * <li>sortedAscending (boolean): whether sorting is ascending.</li>
     * </ul>
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create.
     * @return {qx.ui.core.Widget} the widget that renders the header cell.
     */
    createHeaderCell : function(cellInfo) {
      return true;
    },


    /**
     * Updates a header cell.
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create. This map has the same structure as in {@link #createHeaderCell}.
     * @param cellWidget {qx.ui.core.Widget} the widget that renders the header cell. This is
     *      the same widget formally created by {@link #createHeaderCell}.
     */
    updateHeaderCell : function(cellInfo, cellWidget) {
      return true;
    }
  }
});
