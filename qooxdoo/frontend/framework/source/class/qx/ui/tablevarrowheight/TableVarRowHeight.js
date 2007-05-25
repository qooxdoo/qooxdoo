/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_tablevarrowheight)
#embed(qx.widgettheme/table/selectColumnOrder.png)

************************************************************************ */

/**
 * A table with variable row height.
 */
qx.Class.define("qx.ui.tablevarrowheight.TableVarRowHeight",
{
  extend : qx.ui.table.Table,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param tableModel {qx.ui.table.model.TableModel, null}
   *   The table model to read the data from.
   */
  construct : function(tableModel)
  {
    //
    // Specify our local subclasses of some of Table's internal classes
    //
    this.setNewSelectionManager(function(obj) {
      return new qx.ui.tablevarrowheight.SelectionManager(obj);
    });

    this.setNewSelectionModel(function(obj) {
      return new qx.ui.tablevarrowheight.SelectionModel(obj);
    });

    this.setNewTableColumnModel(function(obj) {
      return new qx.ui.tablevarrowheight.TableColumnModel(obj);
    });

    this.setNewTablePane(function(obj) {
      return new qx.ui.tablevarrowheight.TablePane(obj);
    });

    this.setNewTablePaneHeader(function(obj) {
      return new qx.ui.tablevarrowheight.TablePaneHeader(obj);
    });

    this.setNewTablePaneScroller(function(obj) {
      return new qx.ui.tablevarrowheight.TablePaneScroller(obj);
    });

    this.setNewTablePaneModel(function(columnModel) {
      return new qx.ui.tablevarrowheight.TablePaneModel(columnModel);
    });

    // Call our superclass
    this.base(arguments, tableModel);
  }
});
