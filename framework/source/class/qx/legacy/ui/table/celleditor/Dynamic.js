/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A cell editor factory which can dynamically exchange the cell editor
 * based on information retrieved at runtime. This is useful when different
 * rows in a column should have different cellEditors based on cell content
 * or row metadata. A typical example would be a spreadsheet that has different
 * kind of data in one column.
 *
 */
qx.Class.define("qx.legacy.ui.table.celleditor.Dynamic",
{
  extend : qx.core.Object,
  implement : qx.legacy.ui.table.ICellEditorFactory,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(cellEditorFactoryFunction) {
    this.base(arguments);
    if (cellEditorFactoryFunction)
    {
      this.setCellEditorFactoryFunction(cellEditorFactoryFunction);
    }
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /**
     * Function that returns a cellEditorFactory instance which will be
     * used for the row that is currently being edited. The function is
     * defined like this:
     * <pre class="javascript">
     * myTable.getTableColumnModel().setCellEditorFactory(function(cellInfo){
     *   // based on the cellInfo map or other information, return the
     *   // appropriate cellEditorFactory
     *   if (cellInfo.row == 5)
     *     return new qx.legacy.ui.table.celleditor.CheckBox;
     *   else
     *     return new qx.legacy.ui.table.celleditor.TextField;
     * });
     * </pre>
     **/
    cellEditorFactoryFunction :
    {
      check : "Function",
      nullable : true,
      init : null
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Creates the cell editor based on the cellEditorFactory instance
     * returned by the function stored in the cellEditorFactoryFunction
     * property. Passes the cellInfo map to the function.
     * @return {qx.legacy.ui.core.Widget}
     */
    createCellEditor : function(cellInfo)
    {
      var cellEditorFactoryFunction = this.getCellEditorFactoryFunction();
      if ( ! cellEditorFactoryFunction )
      {
        this.error("No function provided! Aborting.");
      }
      this._cellEditorFactory = cellEditorFactoryFunction(cellInfo);
      var cellEditor = this._cellEditorFactory.createCellEditor(cellInfo);

      return cellEditor;
    },

    /**
     * Retrieves the value  the cell editor based on the current cellEditorFactory
     * instance.
     * @param cellEditor {qx.legacy.ui.core.Widget}
     * @return {Object}
     */
    getCellEditorValue : function(cellEditor)
    {
      var cellEditorFactoryFunction = this.getCellEditorFactoryFunction();
      if ( ! cellEditorFactoryFunction )
      {
        this.error("No function provided! Aborting.");
      }
      var value = this._cellEditorFactory.getCellEditorValue(cellEditor);
      return value;
    }
  }
});
