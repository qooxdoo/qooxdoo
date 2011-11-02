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
 * A factory creating widgets to use for editing table cells.
 */
qx.Interface.define("qx.ui.table.ICellEditorFactory",
{

  members :
  {
    /**
     * Creates a cell editor.
     *
     * The cellInfo map contains the following properties:
     * <ul>
     * <li>value (var): the cell's value.</li>
     * <li>row (int): the model index of the row the cell belongs to.</li>
     * <li>col (int): the model index of the column the cell belongs to.</li>
     * <li>xPos (int): the x position of the cell in the table pane.</li>
     * <li>table (qx.ui.table.Table) reference to the table, the cell belongs to. </li>
     * </ul>
     *
     * @abstract
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create.
     * @return {qx.ui.core.Widget} the widget that should be used as cell editor.
     */
    createCellEditor : function(cellInfo) {
      return true;
    },


    /**
     * Returns the current value of a cell editor.
     *
     * @abstract
     * @param cellEditor {qx.ui.core.Widget} The cell editor formally created by
     *      {@link #createCellEditor}.
     * @return {var} the current value from the editor.
     */
    getCellEditorValue : function(cellEditor) {
      return true;
    }
  }
});
