/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2020 Patrick Buxton

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Pat Buxton (rad-pat)

************************************************************************ */


/**
 * A cell editor factory for editing a virtualtree node label
 */
qx.Class.define("qx.ui.treevirtual.celleditor.NodeEditor",
{
  extend : qx.ui.table.celleditor.TextField,

  members :
  {
    // overridden
    getCellEditorValue : function(cellEditor)
    {
      var label = cellEditor.getValue();  // This will be the new label for the Tree Node

      // validation function will be called with new and old label
      var validationFunc = this.getValidationFunction();
      if (validationFunc ) {
        label = validationFunc(label, cellEditor.originalLabel);
      }

      var newValue = qx.lang.Object.clone(cellEditor.originalValue);
      newValue.label = label;
      return newValue;
    },


    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = this._createEditor();

      // The value in the case of a Tree is a Node and we want the label
      if (cellInfo.value === null || typeof cellInfo.value != "object") {
        cellInfo.value = {label: "", labelPos: 0};
      }

      var label = cellInfo.value.label;
      cellEditor.originalValue = cellInfo.value;
      cellEditor.originalLabel = label;
      cellEditor.setValue("" + label);
      // dynamically pad to the position of the node label - calculated in CellRenderer
      cellEditor.setPaddingLeft(cellInfo.value.labelPos);

      cellEditor.addListener("appear", function() {
        cellEditor.selectAllText();
      });

      return cellEditor;
    },

    _createEditor: function _createEditor() {
      var cellEditor = new qx.ui.form.TextField();
      cellEditor.setAppearance("treevirtual-node-editor-textfield");
      return cellEditor;
    }
  }
});
