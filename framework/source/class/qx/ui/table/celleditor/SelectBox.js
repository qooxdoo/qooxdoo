/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 Christian Boulanger

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A cell editor factory creating select boxes.
 *
 * @appearance table-editor-combobox {qx.ui.form.SelectBox}
 */
qx.Class.define("qx.ui.table.celleditor.SelectBox",
{
  extend : qx.core.Object,
  implement : qx.ui.table.ICellEditorFactory,



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
    },

    /** array of data to construct ListItem widgets with */
    listData :
    {
      check : "Array",
      init : null,
      nullable : true
    }

  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __done : null,


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
            item = new qx.ui.form.ListItem(row[0], row[1], row[2]);
          } else {
            item = new qx.ui.form.ListItem(row, null, row)
          }
          cellEditor.add(item);
        };
      }

      cellEditor.setValue("" + value);
      cellEditor.addListener("appear", function() {
        cellEditor.open();
      });

      return cellEditor;
    },


    // interface implementation
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue() || "";

      // validation function will be called with new and old value
      var validationFunc = this.getValidationFunction();
      if ( ! this.__done && validationFunc )
      {
         value = validationFunc( value, cellEditor.originalValue );
         this.__done = true;
      }

      if (typeof cellEditor.originalValue == "number") {
        value = parseFloat(value);
      }

      return value;
    }
  }
});
