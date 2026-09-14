/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.table.Table", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    createModel() {
      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["ID", "A number", "String", "A date", "Boolean"]);
      tableModel.setData(this.createRandomRows(5));

      return tableModel;
    },

    createRandomRows(rowCount) {
      var rowData = [];
      var nextId = 0;
      var strings = ["a", "b", "c", "d"];
      for (var row = 0; row < rowCount; row++) {
        var date = new Date(row * row * row);
        var number = row % 2 == 0 ? row / 2 : NaN;
        rowData.push([nextId++, number, strings[row % 4], date, row % 2 == 1]);
      }
      return rowData;
    },

    testSortInteger() {
      // table
      var model = this.createModel();
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(0);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][0] >= data[i + 1][0]);
      }

      // sort ascending
      model.sortByColumn(0, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][0] <= data[i + 1][0]);
      }

      table.destroy();
      model.dispose();
    },

    testSortIntegerNaN() {
      // table
      var model = this.createModel();
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i + 1][1]));
        } else if (isNaN(data[i + 1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] >= data[i + 1][1]);
        }
      }

      // sort ascending
      model.sortByColumn(1, true);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i + 1][1]));
        } else if (isNaN(data[i + 1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] <= data[i + 1][1]);
        }
      }

      table.destroy();
      model.dispose();
    },

    testSortIntegerNaNInsensitive() {
      // table
      var model = this.createModel();
      var table = new qx.ui.table.Table(model);
      model.setCaseSensitiveSorting(false);

      // sort descending
      model.sortByColumn(1);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i + 1][1]));
        } else if (isNaN(data[i + 1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] >= data[i + 1][1]);
        }
      }

      // sort ascending
      model.sortByColumn(1, true);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        if (isNaN(data[i][1])) {
          // both should be NaN
          this.assertTrue(isNaN(data[i + 1][1]));
        } else if (isNaN(data[i + 1][1])) {
          // should be a number
          this.assertFalse(isNaN(data[i][1]));
        } else {
          this.assertTrue(data[i][1] <= data[i + 1][1]);
        }
      }

      table.destroy();
      model.dispose();
    },

    testSortStringInsensitive() {
      // table
      var model = this.createModel();
      var table = new qx.ui.table.Table(model);
      model.setCaseSensitiveSorting(false);

      // sort descending
      model.sortByColumn(2);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] >= data[i + 1][2]);
      }

      // sort ascending
      model.sortByColumn(2, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] <= data[i + 1][2]);
      }

      table.destroy();
      model.dispose();
    },

    testSortString() {
      // table
      var model = this.createModel();
      var table = new qx.ui.table.Table(model);

      // sort descending
      model.sortByColumn(2);
      var data = model.getData();
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] >= data[i + 1][2]);
      }

      // sort ascending
      model.sortByColumn(2, true);
      for (var i = 0; i < data.length - 1; i++) {
        this.assertTrue(data[i][2] <= data[i + 1][2]);
      }

      table.destroy();
      model.dispose();
    },

    testRegularListener() {
      var table = new qx.ui.table.Table();

      var executed = false;
      var id = table.addListener("changeRowHeight", () => {
        executed = true;
      });

      this.assertNotNull(id);

      table.removeListenerById(id);

      // invoke event
      table.setRowHeight(111);
      this.assertFalse(executed);

      table.destroy();
    },

    testSpecialListener() {
      var table = new qx.ui.table.Table();
      // use a meta column to see if both events are handled properly
      table.setMetaColumnCounts([1, -1]);

      var executed = false;
      var id = table.addListener("cellClick", () => {
        executed = true;
      });

      this.assertNotNull(id);

      table.removeListenerById(id);

      // invoke synthetic cellClick event
      var scroller = table._getPaneScrollerArr()[0];
      var mouse = new qx.event.type.Mouse();
      mouse.init({}, scroller, scroller, false, true);
      scroller.fireEvent(
        "cellClick",
        qx.ui.table.pane.CellEvent,
        [scroller, mouse, 0, 0],
        true
      );

      this.assertFalse(executed, "Listener not removed");

      mouse.dispose();
      table.destroy();
    },

    testScrollAfterScrollbarVisibilityChange() {
      var rowData = [];
      for (var row = 0; row < 15; row++) {
        rowData.push([row]);
      }

      var tableModel = new qx.ui.table.model.Simple();
      tableModel.setColumns(["ID"]);
      tableModel.setData(rowData);
      var table = new qx.ui.table.Table(tableModel).set({
        width: 200,
        height: 200
      });

      this.getRoot().add(table);

      qx.ui.core.queue.Manager.flush();

      // scroll to the end
      table.getPaneScroller(0).setScrollY(100);
      // resize the first column to show a vertical scrollbar
      table.getTableColumnModel().setColumnWidth(0, 300);
      // resize back
      table.getTableColumnModel().setColumnWidth(0, 100);
      // check that the table is not scrolled back to the top
      this.assertEquals(100, table.getPaneScroller(0).getScrollY());

      table.destroy();
      tableModel.dispose();
    },

    /**
     * Build a mounted, editable one-cell table.
     *
     * @param blurAction {String} the cellEditorBlurAction to apply.
     * @param editorFactory {qx.ui.table.ICellEditorFactory?} a factory to use
     *   for the column, in place of the default text field.
     * @param custom {Map?} the table's custom-config dict.
     * @return {Map} the table, its model and its only pane scroller.
     */
    createEditableTable(blurAction, editorFactory, custom) {
      var model = new qx.ui.table.model.Simple();
      model.setColumns(["Editable"]);
      model.setData([["before"]]);
      model.setColumnEditable(0, true);

      var table = new qx.ui.table.Table(model, custom).set({
        width: 300,
        height: 100,
        cellEditorBlurAction: blurAction
      });

      if (editorFactory) {
        table.getTableColumnModel().setCellEditorFactory(0, editorFactory);
      }
      this.getRoot().add(table);
      this.flush();
      table.setFocusedCell(0, 0, true);

      return {
        table: table,
        model: model,
        scroller: table._getPaneScrollerArr()[0]
      };
    },

    /**
     * A cell editor factory is entitled to return a widget that takes no focus
     * of its own — one that manages its own popup, say. Starting an edit must
     * not try to focus it, since qx.ui.core.Widget#focus throws on an
     * unfocusable widget in a debug build.
     */
    testStartEditingAnUnfocusableCellEditor() {
      var factory = new qx.ui.table.celleditor.TextField();
      factory.createCellEditor = function (cellInfo) {
        return new qx.ui.form.TextField("" + cellInfo.value).set({
          focusable: false
        });
      };

      var fixture = this.createEditableTable("save", factory);

      this.assertTrue(fixture.scroller.startEditing(), "editing started");
      this.assertTrue(fixture.scroller.isEditing());

      fixture.table.destroy();
      fixture.model.dispose();
    },

    /**
     * A factory may decline a particular cell by answering null, which leaves
     * the table not editing — and so with no editor to have wired a blur
     * listener to.
     */
    testACellEditorFactoryCanDeclineTheCell() {
      var factory = new qx.ui.table.celleditor.TextField();
      factory.createCellEditor = function () {
        return null;
      };

      var fixture = this.createEditableTable("save", factory);

      this.assertFalse(
        fixture.scroller.startEditing(),
        "editing did not start"
      );
      this.assertFalse(fixture.scroller.isEditing());

      fixture.table.destroy();
      fixture.model.dispose();
    },

    /**
     * Stopping an edit normally hands the focus back to the table, which is
     * what the Enter key wants.
     */
    testStopEditingReturnsFocusToTheTable() {
      var fixture = this.createEditableTable("nothing");
      fixture.scroller.startEditing();
      fixture.scroller._cellEditor.setValue("after");

      var focused = 0;
      fixture.table.focus = function () {
        focused++;
      };

      fixture.scroller.stopEditing();

      this.assertEquals(1, focused, "the table took the focus back");
      this.assertEquals("after", fixture.model.getValue(0, 0));

      fixture.table.destroy();
      fixture.model.dispose();
    },

    /**
     * The focus leaving the editor applies cellEditorBlurAction — and the save
     * it does must not pull the focus back onto the table.
     *
     * qx.test.ui.table.CellEditorLifecycle covers which focus moves count as
     * leaving, against the editors the framework ships.
     */
    testFocusLeavingTheCellEditorSaves() {
      var fixture = this.createEditableTable("save");
      fixture.scroller.startEditing();
      fixture.scroller._cellEditor.setValue("after");

      var focused = 0;
      fixture.table.focus = function () {
        focused++;
      };
      var editor = fixture.scroller._cellEditor;
      var movedTo = new qx.ui.form.TextField();

      fixture.scroller._onFocusoutCellEditorStopEditing({
        getTarget() {
          return editor;
        },

        getRelatedTarget() {
          return movedTo;
        }
      });

      movedTo.dispose();
      this.assertFalse(fixture.scroller.isEditing(), "the edit was committed");
      this.assertEquals("after", fixture.model.getValue(0, 0));
      this.assertEquals(0, focused, "the focus was left where it went");

      fixture.table.destroy();
      fixture.model.dispose();
    },

    /**
     * Not taking the focus back has to survive a subclass, which is why it is
     * not an argument: `stopEditing` is widely overridden, and an override that
     * declares no parameters of its own forwards none to its super — so an
     * argument would be dropped before it reached `flushEditor`, and the blur
     * save would go back to stealing the focus.
     */
    testFocusIsLeftAloneThroughAnOverriddenStopEditing() {
      if (!qx.Class.isDefined("qx.test.ui.table.ForwardingScroller")) {
        qx.Class.define("qx.test.ui.table.ForwardingScroller", {
          extend: qx.ui.table.pane.Scroller,

          members: {
            stopEditing() {
              super.stopEditing();
            }
          }
        });
      }

      var fixture = this.createEditableTable("save", null, {
        tablePaneScroller(obj) {
          return new qx.test.ui.table.ForwardingScroller(obj);
        }
      });

      fixture.scroller.startEditing();
      fixture.scroller._cellEditor.setValue("after");

      var focused = 0;
      fixture.table.focus = function () {
        focused++;
      };
      var editor = fixture.scroller._cellEditor;
      var movedTo = new qx.ui.form.TextField();

      fixture.scroller._onFocusoutCellEditorStopEditing({
        getTarget() {
          return editor;
        },

        getRelatedTarget() {
          return movedTo;
        }
      });

      movedTo.dispose();
      this.assertEquals("after", fixture.model.getValue(0, 0));
      this.assertEquals(0, focused, "the focus was left where it went");

      fixture.table.destroy();
      fixture.model.dispose();
    },

    /**
     * An editor settling can report the focus as being nowhere for a moment —
     * a ComboBox editor does it repeatedly as it opens. That is not the focus
     * leaving the edit, and acting on it destroys the editor as it appears.
     */
    testFocusGoingNowhereDoesNotEndTheEdit() {
      var fixture = this.createEditableTable("save");
      fixture.scroller.startEditing();
      fixture.scroller._cellEditor.setValue("after");
      var editor = fixture.scroller._cellEditor;

      fixture.scroller._onFocusoutCellEditorStopEditing({
        getTarget() {
          return editor;
        },

        getRelatedTarget() {
          return null;
        }
      });

      this.assertTrue(fixture.scroller.isEditing(), "the edit is still open");
      this.assertEquals(
        "before",
        fixture.model.getValue(0, 0),
        "nothing was written"
      );

      fixture.table.destroy();
      fixture.model.dispose();
    },

    testFocusAfterRemove() {
      var tableModelSimple = new qx.ui.table.model.Simple();
      tableModelSimple.setColumns(["Location", "Team"]);
      var tableSimple = new qx.ui.table.Table(tableModelSimple);

      var data = [
        [1, "team1"],
        [2, "team2"],
        [3, "team3"]
      ];

      tableModelSimple.setData(data);

      // select and focus row 2
      tableSimple.getSelectionModel().addSelectionInterval(1, 1);
      tableSimple.setFocusedCell(1, 1);

      // remove this row
      tableModelSimple.removeRows(1, 1);

      // check if the selection and the focus is gone
      this.assertEquals(null, tableSimple.getFocusedRow()); // don't use assertNull because it can be undefined
      this.assertEquals(0, tableSimple.getSelectionModel().getSelectedCount());

      tableSimple.destroy();
      tableModelSimple.dispose();
    }
  }
});
