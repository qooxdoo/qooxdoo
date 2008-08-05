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

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A cell editor factory creating password fields fields.
 *
 * @appearance table-editor-textfield {qx.legacy.ui.form.TextField}
 */
qx.Class.define("qx.legacy.ui.table.celleditor.PasswordField",
{
  extend : qx.core.Object,
  implement : qx.legacy.ui.table.ICellEditorFactory,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

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

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = new qx.legacy.ui.form.PasswordField;
      cellEditor.setAppearance("table-editor-textfield");
      cellEditor.setLiveUpdate(true);
      cellEditor.originalValue = cellInfo.value;
      if ( cellInfo.value === null )
      {
        cellInfo.value = "";
      }
      cellEditor.setValue("" + cellInfo.value);

      cellEditor.addListener("appear", function() {
        this.selectAll();
      });

      return cellEditor;
    },

    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if ( ! this._done && validationFunc )
      {
         value = validationFunc( value, cellEditor.originalValue );
         this._done = true;
      }

      if (typeof cellEditor.originalValue == "number") {
        value = parseFloat(value);
      }

      return value;
    }
  }
});
