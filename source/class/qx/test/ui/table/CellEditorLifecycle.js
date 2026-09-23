/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2026 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * Drives every cell editor the framework ships through the real editing
 * lifecycle on a mounted table: start the edit, change the value, then let the
 * focus leave, under each {@link qx.ui.table.Table#cellEditorBlurAction} in
 * turn.
 *
 * The per-editor tests under qx.test.ui.table.celleditor.* call the factories
 * directly with a hand-built cellInfo, so they say nothing about how an editor
 * behaves once qx.ui.table.pane.Scroller is driving it — which is where the
 * focus handling lives, and where an editor that manages focus of its own (the
 * CheckBox editor hands focus to its child) parts company with a plain field.
 *
 * The focus is moved as soon as the edit starts, deliberately: the blur action
 * has to hold from the first moment, not once some deferred wiring has caught
 * up.
 */
qx.Class.define("qx.test.ui.table.CellEditorLifecycle", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    __fixtures: null,

    /**
     * One spec per cell editor the framework ships. `edit` makes a change the
     * editor would report, and `edited` is what committing it must write.
     *
     * @return {Array} the specs.
     */
    editorSpecs() {
      return [
        {
          name: "TextField",
          create: () => new qx.ui.table.celleditor.TextField(),
          value: "before",
          edit: editor => editor.setValue("after"),
          edited: "after"
        },

        {
          name: "PasswordField",
          create: () => new qx.ui.table.celleditor.PasswordField(),
          value: "before",
          edit: editor => editor.setValue("after"),
          edited: "after"
        },

        {
          name: "ComboBox",
          create() {
            var factory = new qx.ui.table.celleditor.ComboBox();
            factory.setListData(["before", "after"]);
            return factory;
          },
          value: "before",
          edit: editor => editor.setValue("after"),
          edited: "after"
        },

        {
          name: "SelectBox",
          create() {
            var factory = new qx.ui.table.celleditor.SelectBox();
            factory.setListData([
              ["Before", null, "before"],
              ["After", null, "after"]
            ]);

            return factory;
          },
          value: "before",
          edit(editor) {
            editor.setSelection([
              editor.getChildrenContainer().findItem("After")
            ]);
          },
          edited: "after"
        },

        {
          // A focusable composite that hands the focus straight to its child
          // checkbox, so the editor reports a focusout of its own the moment
          // the edit starts, and the child — not the editor — is what reports
          // one when the focus really leaves. Neither may be read at face value.
          name: "CheckBox",
          create: () => new qx.ui.table.celleditor.CheckBox(),
          value: false,
          edit: editor => editor.getChildren()[0].setValue(true),
          edited: true
        },

        {
          // Picks a factory per cell; whatever it hands back has to take part
          // in the lifecycle like any other editor.
          name: "Dynamic",
          create() {
            var delegate = new qx.ui.table.celleditor.TextField();
            var factory = new qx.ui.table.celleditor.Dynamic(() => delegate);
            factory.__delegate = delegate;
            return factory;
          },
          value: "before",
          edit: editor => editor.setValue("after"),
          edited: "after"
        }
      ];
    },

    /**
     * Mount a one-cell table wired to `spec`'s editor with the given blur
     * action, start editing, make the change, then move the focus off it.
     *
     * @param spec {Map} an entry from {@link #editorSpecs}.
     * @param blurAction {String} the cellEditorBlurAction to apply.
     * @return {Map} the pane scroller that did the editing, and the table model.
     */
    blurAnEdit(spec, blurAction) {
      var model = new qx.ui.table.model.Simple();
      model.setColumns(["Editable"]);
      model.setData([[spec.value]]);
      model.setColumnEditable(0, true);

      var factory = spec.create();
      var table = new qx.ui.table.Table(model).set({
        width: 300,
        height: 100,
        cellEditorBlurAction: blurAction
      });

      table.getTableColumnModel().setCellEditorFactory(0, factory);
      var elsewhere = new qx.ui.form.TextField();
      this.getRoot().add(table);
      this.getRoot().add(elsewhere, { top: 200 });
      this.__fixtures.push({ table: table, model: model, factory: factory });
      this.flush();

      table.setFocusedCell(0, 0, true);
      var scroller = table._getPaneScrollerArr()[0];
      this.assertTrue(scroller.startEditing(), spec.name + ": editing started");
      this.flush();

      spec.edit(scroller._cellEditor);
      elsewhere.focus();
      this.flush();

      return { scroller: scroller, model: model };
    },

    setUp() {
      super.setUp();
      this.__fixtures = [];
    },

    tearDown() {
      super.tearDown();
      this.__fixtures.forEach(function (fixture) {
        fixture.table.destroy();
        fixture.model.dispose();
        if (fixture.factory.__delegate) {
          fixture.factory.__delegate.dispose();
        }
        fixture.factory.dispose();
      });

      this.__fixtures = null;
      this.flush();
    },

    testSaveCommitsTheEdit() {
      this.editorSpecs().forEach(function (spec) {
        var run = this.blurAnEdit(spec, "save");

        this.assertFalse(
          run.scroller.isEditing(),
          spec.name + ": the edit was ended"
        );

        this.assertEquals(
          spec.edited,
          run.model.getValue(0, 0),
          spec.name + ": the edit was written"
        );
      }, this);
    },

    testCancelDiscardsTheEdit() {
      this.editorSpecs().forEach(function (spec) {
        var run = this.blurAnEdit(spec, "cancel");

        this.assertFalse(
          run.scroller.isEditing(),
          spec.name + ": the edit was ended"
        );

        this.assertEquals(
          spec.value,
          run.model.getValue(0, 0),
          spec.name + ": the edit was discarded"
        );
      }, this);
    },

    /**
     * The default, and what every table that never sets the property gets: the
     * focus leaving means nothing, and the edit stays open on the cell.
     */
    testNothingLeavesTheEditOpen() {
      this.editorSpecs().forEach(function (spec) {
        var run = this.blurAnEdit(spec, "nothing");

        this.assertTrue(
          run.scroller.isEditing(),
          spec.name + ": the edit is still open"
        );

        this.assertEquals(
          spec.value,
          run.model.getValue(0, 0),
          spec.name + ": nothing was written"
        );
      }, this);
    }
  }
});
