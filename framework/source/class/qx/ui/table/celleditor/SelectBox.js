/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Christian Boulanger

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A cell editor factory creating select boxes.
 */
qx.Class.define("qx.ui.table.celleditor.SelectBox", {
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,


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
    },

    /** array of data to construct ListItem widgets with */
    listData :
    {
      check : "Array",
      init : null,
      nullable : true
    }

  },


  members :
  {
    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = new qx.ui.form.SelectBox().set({
        appearance: "table-editor-selectbox"
      });

      var value = cellInfo.value;
      cellEditor.originalValue = value;

      // check if renderer does something with value
      var cellRenderer = cellInfo.table.getTableColumnModel().getDataCellRenderer(cellInfo.col);
      var label = cellRenderer._getContentHtml(cellInfo);
      if ( value != label ) {
        value = label;
      }

      // replace null values
      if ( value === null ) {
        value = "";
      }

      var list = this.getListData();
      if (list)
      {
        var item;

        for (var i=0,l=list.length; i<l; i++)
        {
          var row = list[i];
          if ( row instanceof Array ) {
            item = new qx.ui.form.ListItem(row[0], row[1]);
            item.setUserData("row", row[2]);
            if (value == row[2]) {
              label = row[0];
            }
          } else {
            item = new qx.ui.form.ListItem(row, null);
            item.setUserData("row", row);
          }
          cellEditor.add(item);
        };
      }

      if (label != null) {
        var itemToSelect = cellEditor.getChildrenContainer().findItem(label + "");
      }

      if (itemToSelect) {
        cellEditor.setSelection([itemToSelect]);
      } else {
        cellEditor.resetSelection();
      }
      cellEditor.addListener("appear", function() {
        cellEditor.open();
      });

      return cellEditor;
    },


    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var selection = cellEditor.getSelection();
      var value = "";

      if (selection && selection[0]) {
        var userValue = selection[0].getUserData("row");
        value = userValue === undefined ? selection[0].getLabel() : userValue;
      }

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
