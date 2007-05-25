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
 * A cell editor factory creating text fields.
 *
 * @appearance table-editor-textfield {qx.ui.form.TextField}
 */
qx.Class.define("qx.ui.table.celleditor.TextField",
{
  extend : qx.ui.table.celleditor.Factory,




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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @return {var} TODOC
     */
    createCellEditor : function(cellInfo)
    {
      var cellEditor = new qx.ui.form.TextField;
      cellEditor.setAppearance("table-editor-textfield");
      cellEditor.setLiveUpdate(true);
      cellEditor.originalValue = cellInfo.value;
      cellEditor.setValue("" + cellInfo.value);

      cellEditor.addEventListener("appear", function() {
        this.selectAll();
      });

      return cellEditor;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param cellEditor {var} TODOC
     * @return {var} TODOC
     */
    getCellEditorValue : function(cellEditor)
    {
      var value = cellEditor.getValue();

      if (typeof cellEditor.originalValue == "number") {
        value = parseFloat(value);
      }

      return value;
    }
  }
});
