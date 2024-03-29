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

qx.Class.define("qx.test.ui.table.celleditor.SelectBox", {
  extend: qx.test.ui.LayoutTestCase,

  members: {
    setUp() {
      this.factory = new qx.ui.table.celleditor.SelectBox();
    },

    tearDown() {
      super.tearDown();
      this.factory.dispose();
    },

    _getCellInfo(value) {
      return {
        value: value,
        col: 0,
        table: {
          getTableColumnModel() {
            return {
              getDataCellRenderer(col) {
                return {
                  _getContentHtml(cellInfo) {
                    return cellInfo.value;
                  }
                };
              }
            };
          }
        }
      };
    },

    testCreateCellEditor() {
      var editor = this.factory.createCellEditor(this._getCellInfo());

      this.assertInstance(editor, qx.ui.core.Widget);
      this.assertEquals(0, editor.getSelection().length);

      editor.destroy();
    },

    testCreateCellEditorWithValue() {
      this.factory.setListData(["juhu", "kinners"]);
      var editor = this.factory.createCellEditor(this._getCellInfo("juhu"));

      this.assertEquals("juhu", editor.getSelection()[0].getLabel());

      editor.destroy();
    },

    testGetCellEditorValue() {
      this.factory.setListData(["juhu", "kinners"]);
      var editor = this.factory.createCellEditor(this._getCellInfo());

      editor.setSelection([editor.getChildren()[1]]);
      this.assertEquals("kinners", this.factory.getCellEditorValue(editor));

      editor.destroy();
    },

    testValidationFunction() {
      this.factory.setListData(["juhu", "kinners"]);

      var called = false;

      this.factory.setValidationFunction(function (value) {
        called = true;
        return "_" + value + "_";
      });

      var editor = this.factory.createCellEditor(this._getCellInfo());

      editor.setSelection([editor.getChildren()[0]]);
      var value = this.factory.getCellEditorValue(editor);
      this.assert(called);
      this.assertEquals("_juhu_", value);

      editor.setSelection([editor.getChildren()[1]]);
      var value = this.factory.getCellEditorValue(editor);
      this.assert(called);
      this.assertEquals("_kinners_", value);
    },

    testAutoconvertToNumber() {
      this.factory.setListData(["10.0", "-12.5"]);
      var editor = this.factory.createCellEditor(this._getCellInfo(10.0));

      editor.setSelection([editor.getChildren()[1]]);
      this.assertEquals(-12.5, this.factory.getCellEditorValue(editor));
      this.assertNumber(this.factory.getCellEditorValue(editor));

      editor.destroy();
    }
  }
});
