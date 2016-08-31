/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Boulanger (cboulanger)

************************************************************************ */

/**
 * A cell renderer factory which can dynamically exchange the cell renderer
 * based on information retrieved at runtime. This is useful when different
 * rows in a column should have different cell renderer based on cell content
 * or row metadata. A typical example would be a spreadsheet that has different
 * kind of data in one column.
 *
 */
qx.Class.define("qx.ui.table.cellrenderer.Dynamic", {
  extend : qx.ui.table.cellrenderer.Default,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param cellRendererFactoryFunction {Function?null} The initial value for
   *    the property {@link #cellRendererFactoryFunction}.
   */
  construct : function(cellRendererFactoryFunction)
  {
    this.base(arguments);
    if (cellRendererFactoryFunction)
    {
      this.setCellRendererFactoryFunction(cellRendererFactoryFunction);
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
     * Function that returns a cellRenderer instance which will be
     * used for the row that is currently being edited. The function is
     * defined like this:
     *
     * <pre class="javascript">
     * myTable.getTableColumnModel().setCellRenderer(function(cellInfo){
     *   // based on the cellInfo map or other information, return the
     *   // appropriate cell renderer
     *   if (cellInfo.row == 5)
     *     return new qx.ui.table.cellrenderer.Boolean;
     *   else
     *     return new qx.ui.table.cellrenderer.Default;
     * });
     * </pre>
     *
     * the function MUST return at least a qx.ui.table.cellrenderer.Default
     **/
    cellRendererFactoryFunction :
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
     * Overridden; called whenever the cell updates. The cell will call the
     * function stored in the cellRendererFactoryFunction to retrieve the
     * cell renderer which should be used for this particular cell
     *
     * @param cellInfo {Map} A map containing the information about the cell to
     *     create.
     * @param htmlArr {String[]} Target string container. The HTML of the data
     *     cell should be appended to this array.
     * @return {String} Data cell HTML
     */
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      var cellRendererFactoryFunction = this.getCellRendererFactoryFunction();
      if ( ! cellRendererFactoryFunction ) {
        throw new Error("No function provided! Aborting.");
      }
      var cellRenderer = cellRendererFactoryFunction(cellInfo);

      return cellRenderer.createDataCellHtml(cellInfo, htmlArr);
    }
  }
});
