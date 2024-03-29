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

qx.Class.define("qx.test.ui.table.celleditor.ComboBox", {
  extend: qx.test.ui.table.celleditor.AbstractField,

  members: {
    setUp() {
      this.factory = new qx.ui.table.celleditor.ComboBox();
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

    testChangeEditorSelection() {
      this.factory.setListData(["elefant", "affe", "banane"]);
      var editor = this.factory.createCellEditor(this._getCellInfo("affe"));

      var list = editor.getChildControl("list");
      this.assertEquals("affe", list.getSelection()[0].getLabel());
      list.setSelection([list.getChildren()[2]]);

      this.assertEquals("banane", this.factory.getCellEditorValue(editor));

      editor.destroy();
    }
  }
});
