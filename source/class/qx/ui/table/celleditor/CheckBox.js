/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 David Perez

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez (david-perez)

************************************************************************ */

/**
 * For editing boolean data in a checkbox. It is advisable to use this in
 * conjunction with {@link qx.ui.table.cellrenderer.Boolean}.
 */
qx.Class.define("qx.ui.table.celleditor.CheckBox", {
  extend: qx.core.Object,
  implement: qx.ui.table.ICellEditorFactory,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // interface implementation
    createCellEditor(cellInfo) {
      var editor = new qx.ui.container.Composite(
        new qx.ui.layout.HBox().set({
          alignX: "center",
          alignY: "middle"
        })
      ).set({
        focusable: true
      });

      var checkbox = new qx.ui.form.CheckBox().set({
        value: cellInfo.value
      });

      // Enter belongs to the table, which ends the edit on it as it does for
      // every other editor. A checkbox would take it as a toggle and stop it
      // there, so only Space is left to the checkbox. Its keyup handler acts
      // only on a key its keydown handler has pressed.
      checkbox.removeListener("keydown", checkbox._onKeyDown);
      checkbox.addListener("keydown", function (e) {
        if (e.getKeyIdentifier() != "Enter") {
          this._onKeyDown(e);
        }
      });

      editor.add(checkbox);

      // propagate focus
      editor.addListener("focus", function () {
        checkbox.focus();
      });

      // propagate active state
      editor.addListener("activate", function () {
        checkbox.activate();
      });

      return editor;
    },

    // interface implementation
    getCellEditorValue(cellEditor) {
      return cellEditor.getChildren()[0].getValue();
    }
  }
});
