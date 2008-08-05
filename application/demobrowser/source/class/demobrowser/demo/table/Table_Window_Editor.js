/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This table example shows how to use a modal window for a cell editor.
 * Although this is a very simple one, cell editors using modal windows
 * can be as sophisticated as one likes, so are useful for when a cell's
 * data is composed of many discrete parts that could be edited
 * individually. In this example, the "A number" column is editable.
 */
qx.Class.define("demobrowser.demo.table.Table_Window_Editor",
{
  extend : demobrowser.demo.table.TableDemo,

  members :
  {
    getCaption : function() {
      return "Table with window cell editor";
    },


    createTable : function()
    {
      // Create the initial data
      var rowData = this.createRandomRows(50);

      // table model
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns([ "ID", "A number", "A date", "A boolean" ]);
      tableModel.setData(rowData);
      tableModel.setColumnEditable(1, true);

      // Customize the table column model.  We want one that automatically
      // resizes columns.
      var custom =
      {
        tableColumnModel : function(obj) {
          return new qx.ui.table.columnmodel.Resize(obj);
        }
      };

      // table
      var table = new qx.ui.table.Table(tableModel, custom);

      table.getSelectionModel().setSelectionMode(qx.ui.table.selection.Model.MULTIPLE_INTERVAL_SELECTION);

      //
      // Specify the resize behavior...  First, get the table column model,
      // which we specified to be a ResizeTableColumModel object.
      //
      var tcm = table.getTableColumnModel();

      // Obtain the behavior object to manipulate
      var resizeBehavior = tcm.getBehavior();

      // This uses the set() method to set all attriutes at once; uses flex
      resizeBehavior.set(0, { width:"1*", minWidth:40, maxWidth:80  });

      // We could also set them individually:
      resizeBehavior.setWidth(1, "50%");
      resizeBehavior.setMinWidth(1, 100);
      resizeBehavior.setMaxWidth(1, 320);

      // Set one fixed width column
      resizeBehavior.set(3, { width:100 });

      // Display a checkbox in column 3
      tcm.setDataCellRenderer(3, new qx.ui.table.cellrenderer.Boolean());

      // We don't want the focus indicator.
      table.setShowCellFocusIndicator(false);

      // Specify the cell editor factory.  Can't use default (or,
      // actually, any in-cell editor) with no focus indicator available.
      // We'll instead use a modal cell editor.  Its cell editor factory
      // class, ModalCellEditorFactory(), is declared towards the end of
      // this file.
      tcm.setCellEditorFactory(1, new ModalCellEditorFactory());

      return table;
    }
  }
});

qx.Class.define("ModalCellEditorFactory",
{
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,

  members :
  {
    // overridden
    createCellEditor : function(cellInfo)
    {
      // Create the cell editor window, since we need to return it
      // immediately.
      cellEditor = new qx.ui.window.Window("Cell Editor");
      cellEditor.setLayout(new qx.ui.layout.HBox(4));
      cellEditor.set(
      {
        padding: 3,
        modal: true,
        showClose: false,
        showMaximize: false,
        showMinimize: false
      });
      cellEditor.moveTo(300, 250);


      cellEditor.addListener("appear", function(e)
      {
        cellEditor.__cellEditor.focus();
        cellEditor.__cellEditor.setSelection(0, cellEditor.__cellEditor.getValue().length);
      });


      // Create a text field in which to edit the data
      cellEditor.__cellEditor = new qx.ui.form.TextField(cellInfo.value + "").set({
        allowGrowY: true
      });
      cellEditor.add(cellEditor.__cellEditor);

      // Create the "Save" button to close the cell editor
      var save = new qx.ui.form.Button("Save");
      save.addListener("execute", function(e) {
        cellEditor.close();
      });
      cellEditor.add(save);

      // Let them press Enter from the cell editor text field to finish.
      var command = new qx.event.Command("Enter");
      command.addListener("execute", function(e)
      {
        save.execute();
        command.dispose();
        command = null;
      });

      return cellEditor;
    },

    // overridden
    getCellEditorValue : function(cellEditor)
    {
      // Return the value in the text field
      return parseFloat(cellEditor.__cellEditor.getValue());
    }
  }
});