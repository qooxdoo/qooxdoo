/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A cell editor factory creating text fields.
 */
qx.Class.define("qx.ui.table.celleditor.TextField",
{
  extend : qx.ui.table.celleditor.AbstractField,

  members :
  {
    // overridden
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if (validationFunc ) {
        value = validationFunc( value, cellEditor.originalValue );
      }
     
      if (typeof cellEditor.originalValue == "number") {
        // Correct problem of NaN displaying when value is null string.
        //if (value != null) {
        if (value != null && value != '') {
          value = parseFloat(value);
        }
      }
      return value;
    },


    _createEditor : function()
    {
      var cellEditor = new qx.ui.form.TextField();
      cellEditor.setAppearance("table-editor-textfield");
      return cellEditor;
    }
  }
});
