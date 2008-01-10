/* ************************************************************************

    qooxdoo - the new era of web development

    http://qooxdoo.org

    Copyright:
      2007 by Christian Boulanger

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
 * A cell renderer factory which can dynamically exchange the cell renderer
 * based on information retrieved at runtime. This is useful when different
 * rows in a column should have different cell renderer based on cell content
 * or row metadata. A typical example would be a spreadsheet that has different
 * kind of data in one column.
 *
 */
qx.Class.define("qx.ui.table.cellrenderer.Dynamic",
{
  extend : qx.ui.table.cellrenderer.Default,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
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
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String}
     */
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      var cellRendererFactoryFunction = this.getCellRendererFactoryFunction();
      if ( ! cellRendererFactoryFunction )
      {
        this.error("No function provided! Aborting.");
      }
      var cellRenderer = cellRendererFactoryFunction(cellInfo);

      return cellRenderer.createDataCellHtml(cellInfo, htmlArr);
    }
  }
});
