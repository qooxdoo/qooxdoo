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
 * A cell renderer for data cells.
 */
qx.Interface.define("qx.ui.table.ICellRenderer",
{

  members :
  {
    /**
     * Creates the HTML for a data cell.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>value (var): the cell's value.</li>
     * <li>rowData (var): contains the row data for the row, the cell belongs to.
     *   The kind of this object depends on the table model, see
     *   {@link qx.ui.table.ITableModel#getRowData}</li>
     * <li>row (int): the model index of the row the cell belongs to.</li>
     * <li>col (int): the model index of the column the cell belongs to.</li>
     * <li>table (qx.ui.table.Table): the table the cell belongs to.</li>
     * <li>xPos (int): the x position of the cell in the table pane.</li>
     * <li>selected (boolean): whether the cell is selected.</li>
     * <li>focusedRow (boolean): whether the cell is in the same row as the
     *   focused cell.</li>
     * <li>editable (boolean): whether the cell is editable.</li>
     * <li>style (string): The CSS styles that should be applied to the outer HTML
     *   element.</li>
     * <li>styleLeft (string): The left position of the cell.</li>
     * <li>styleWidth (string): The cell's width (pixel).</li>
     * <li>styleHeight (string): The cell's height (pixel).</li>
     * </ul>
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *     create.
     * @param htmlArr {String[]} Target string container. The HTML of the data
     *     cell should be appended to this array.
     *
     * @return {Boolean|undefined}
     *   A return value of <i>true</i> specifies that no additional cells in
     *   the row shall be rendered. This may be used, for example, for
     *   separator rows or for other special rendering purposes. Traditional
     *   cell renderers had no defined return value, so returned nothing
     *   (undefined). If this method returns either false or nothing, then
     *   rendering continues with the next cell in the row, which the normal
     *   mode of operation.
     */
    createDataCellHtml : function(cellInfo, htmlArr) {
      return true;
    }

  }
});
