/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2026 qooxdoo contributors

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

/**
 * A minimal form widget whose selection is a data array
 * ({@link qx.data.controller.ISelection}), like the virtual select box of
 * deprecated.qx.ui.list, for testing the form classes without that package.
 */
qx.Class.define("qx.test.ui.form.fixture.DataSelectionField", {
  extend: qx.ui.core.Widget,
  include: [qx.ui.form.MForm],
  implement: [qx.ui.form.IForm, qx.data.controller.ISelection],

  construct() {
    super();
    this.setSelection(new qx.data.Array());
  },

  properties: {
    /** The selected items */
    selection: {
      check: "qx.data.Array",
      event: "changeSelection",
      nullable: true,
      init: null
    }
  },

  members: {
    /**
     * Returns the first selected item.
     *
     * @return {var|null} the selected item
     */
    getValue() {
      let selection = this.getSelection();
      return selection && selection.getLength() > 0
        ? selection.getItem(0)
        : null;
    }
  },

  destruct() {
    let selection = this.getSelection();
    if (selection) {
      selection.dispose();
    }
  }
});
