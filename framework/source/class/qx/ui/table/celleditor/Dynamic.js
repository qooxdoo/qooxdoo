/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * A cell editor factory which can dynamically exchange the cell editor
 * based on information retrieved at runtime. This is useful when different
 * rows in a column should have different cellEditors based on cell content
 * or row meta data. A typical example would be a spreadsheet that has different
 * kind of data in one column.
 *
 */
qx.Class.define("qx.ui.table.celleditor.Dynamic",
{
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param cellEditorFactoryFunction {Function?null} the factory function
   *    {@link #cellEditorFactoryFunction}.
   */
  construct : function(cellEditorFactoryFunction)
  {
    this.base(arguments);
    if (cellEditorFactoryFunction)
    {
      this.setCellEditorFactoryFunction(cellEditorFactoryFunction);
    }

    this.__infos = {};
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
     *     return new qx.ui.table.celleditor.CheckBox;
     *   else
     *     return new qx.ui.table.celleditor.TextField;
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
    __cellEditorFactory : null,
    __infos : null,


    /**
     * Creates the cell editor based on the cellEditorFactory instance
     * returned by the function stored in the cellEditorFactoryFunction
     * property. Passes the cellInfo map to the function.
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *      create.
     * @return {qx.ui.core.Widget}
     */
    createCellEditor : function(cellInfo)
    {
      var cellEditorFactoryFunction = this.getCellEditorFactoryFunction();

      if (qx.core.Environment.get("qx.debug")) {
        this.assertFunction(cellEditorFactoryFunction, "No function provided! Aborting.");
      }

      this.__cellEditorFactory = cellEditorFactoryFunction(cellInfo);
      var cellEditor = this.__cellEditorFactory.createCellEditor(cellInfo);

      // save the cell info to the editor (needed for getting the value)
      this.__infos[cellEditor.toHashCode()] = cellInfo;

      return cellEditor;
    },


    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var cellEditorFactoryFunction = this.getCellEditorFactoryFunction();

      if (qx.core.Environment.get("qx.debug")) {
        this.assertFunction(cellEditorFactoryFunction, "No function provided! Aborting.");
      }

      var cellInfo = this.__infos[cellEditor.toHashCode()];
      // update the propper factory
      this.__cellEditorFactory = cellEditorFactoryFunction(cellInfo);
      var value = this.__cellEditorFactory.getCellEditorValue(cellEditor);
      return value;
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__cellEditorFactory = null;
  }
});
