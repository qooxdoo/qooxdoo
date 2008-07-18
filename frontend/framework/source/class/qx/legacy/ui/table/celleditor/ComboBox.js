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
     * Christian Boulanger (cboulanger)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A cell editor factory creating combo boxes.
 *
 * @appearance table-editor-combobox {qx.legacy.ui.form.ComboBox}
 */
qx.Class.define("qx.legacy.ui.table.celleditor.ComboBox",
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

    /** whether combobox should be editable */
    editable :
    {
      check : "Boolean",
      init : true
    },

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
    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var cellEditor = new qx.legacy.ui.form.ComboBox;
      cellEditor.setEditable(this.getEditable());
      cellEditor.setBorder(null);
      cellEditor.originalValue = cellInfo.value;

      var field = cellEditor.getField();
      field.setLiveUpdate(true);
      field.setAppearance("table-editor-textfield");

      var value = cellInfo.value;

      // check if renderer does something with value
      var cellRenderer = cellInfo.table.getTableColumnModel().getDataCellRenderer(cellInfo.col);
      var label        = cellRenderer._getContentHtml(cellInfo);
      if ( value != label )
      {
        value = label;
      }

      // replace null values
      if ( value === null )
      {
        value = "";
      }

      field.setValue("" + value);

      field.addListener("appear", function() {
        this.selectAll();
      });

      var list = cellEditor.getList();
      if ( this.getListData() )
      {
        var selectedItem;

        this.getListData().forEach(function(row)
        {
          if ( row instanceof Array ) {
            var item = new qx.legacy.ui.form.ListItem ( row[0],row[1],row[2]);
          } else {
            var item = new qx.legacy.ui.form.ListItem (row,null,row)
          }
          list.add(item);

          if (cellInfo.value == item.getValue()) {
            var selectedItem = item;
          }
        });

        if (selectedItem) {
          cellEditor.setSelected(selectedItem);
        }
      }

      return cellEditor;
    },

    /**
     * retrieves value from TextField (editable combobox) or
     * selected ListItem (non-editable combobox) and validates value
     * @param cellEditor {qx.legacy.ui.core.Widget}
     * @return {Object}
     */
    getCellEditorValue : function(cellEditor)
    {
      var value;

      if (cellEditor.isEditable())
      {
        value = cellEditor.getValue();
      }
      else if( cellEditor.getList().getSelectedItem() )
      {
        value = cellEditor.getList().getSelectedItem().getValue();
      }
      else
      {
        value = "";
      }

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
