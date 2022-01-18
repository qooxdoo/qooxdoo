/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.table.celleditor.AbstractField", {
  extend: qx.test.ui.LayoutTestCase,
  type: "abstract",

  members: {
    setUp() {
      throw new Error("Abstract method call!");
    },

    tearDown() {
      this.flush();
    },

    _getCellInfo(value) {
      return { value: value };
    },

    testCreateCellEditor() {
      var editor = this.factory.createCellEditor(this._getCellInfo());

      this.assertInstance(editor, qx.ui.core.Widget);
      this.assertEquals("", editor.getValue());

      editor.destroy();
    },

    testCreateCellEditorWithValue() {
      var editor = this.factory.createCellEditor(this._getCellInfo("juhu"));
      this.assertEquals("juhu", editor.getValue());

      editor.destroy();
    },

    testGetCellEditorValue() {
      var editor = this.factory.createCellEditor(this._getCellInfo());

      editor.setValue("Kinners");
      this.assertEquals("Kinners", this.factory.getCellEditorValue(editor));

      editor.destroy();
    },

    testValidationFunction() {
      var called = false;

      this.factory.setValidationFunction(function (value) {
        called = true;
        return "_" + value + "_";
      });

      var editor = this.factory.createCellEditor(this._getCellInfo());

      editor.setValue("juhu");
      var value = this.factory.getCellEditorValue(editor);
      this.assert(called);
      this.assertEquals("_juhu_", value);

      editor.setValue("kinners");
      var value = this.factory.getCellEditorValue(editor);
      this.assert(called);
      this.assertEquals("_kinners_", value);
    },

    testAutoconvertToNumber() {
      var editor = this.factory.createCellEditor(this._getCellInfo(10.0));

      editor.setValue("-12.5");
      this.assertEquals(-12.5, this.factory.getCellEditorValue(editor));
      this.assertNumber(this.factory.getCellEditorValue(editor));

      editor.destroy();
    }
  }
});
