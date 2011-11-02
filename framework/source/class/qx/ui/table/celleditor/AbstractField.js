/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * An abstract cell editor factory creating text/password/spinner/... fields.
 */
qx.Class.define("qx.ui.table.celleditor.AbstractField",
{
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,
  type : "abstract",


  properties :
  {
    /**
     * function that validates the result
     * the function will be called with the new value and the old value and is
     * supposed to return the value that is set as the table value.
     **/
    validationFunction :
    {
      check : "Function",
      nullable : true,
      init : null
    }
  },


  members :
  {
    /**
     * Factory to create the editor widget
     *
     * @return {qx.ui.core.Widget} The editor widget
     */
    _createEditor : function() {
      throw new Error("Abstract method call!");
    },


    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = this._createEditor();

      cellEditor.originalValue = cellInfo.value;
      if (cellInfo.value === null || cellInfo.value === undefined) {
        cellInfo.value = "";
      }
      cellEditor.setValue("" + cellInfo.value);

      cellEditor.addListener("appear", function() {
        cellEditor.selectAllText();
      });

      return cellEditor;
    },


    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if (validationFunc ) {
        value = validationFunc( value, cellEditor.originalValue );
      }

      if (typeof cellEditor.originalValue == "number") {
        value = parseFloat(value);
      }

      return value;
    }
  }
});
