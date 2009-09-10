/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/**
 * Interface for a row renderer.
 */
qx.Interface.define("qx.ui.table.IRowRenderer",
{
  members :
  {
    /**
     * Updates a data row.
     *
     * The rowInfo map contains the following properties:
     * <ul>
     * <li>rowData (var): contains the row data for the row.
     *   The kind of this object depends on the table model, see
     *   {@link TableModel#getRowData()}</li>
     * <li>row (int): the model index of the row.</li>
     * <li>selected (boolean): whether a cell in this row is selected.</li>
     * <li>focusedRow (boolean): whether the focused cell is in this row.</li>
     * <li>table (qx.ui.table.Table): the table the row belongs to.</li>
     * </ul>
     *
     * @abstract
     * @param rowInfo {Map} A map containing the information about the row to
     *      update.
     * @param rowElement {element} the DOM element that renders the data row.
     */
    updateDataRowElement : function(rowInfo, rowElement) {},


    /**
     * Get the row's height CSS style taking the box model into account
     *
     * @param height {Integer} The row's (border-box) height in pixel
     */
    getRowHeightStyle : function(height) {},


    /**
     * Create a style string, which will be set as the style property of the row.
     *
     * @param rowInfo {Map} A map containing the information about the row to
     *      update. See {@link #updateDataRowElement} for more information.
     */
    createRowStyle : function(rowInfo) {},


    /**
     * Create a HTML class string, which will be set as the class property of the row.
     *
     * @param rowInfo {Map} A map containing the information about the row to
     *      update. See {@link #updateDataRowElement} for more information.
     */
    getRowClass : function(rowInfo) {}

  }
});
