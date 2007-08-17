/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 David Perez

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * David Perez (david-perez)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * For editing boolean data in a checkbox. It is advisable to use this in
 * conjuntion with {@link qx.ui.table.cellrenderer.Boolean}.
 */
qx.Class.define("qx.ui.table.celleditor.CheckBox",
{
  extend : qx.core.Target,
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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var editor = new qx.ui.form.CheckBox;
      editor.setChecked(cellInfo.value);

      return editor;
    },

    // interface implementation
    getCellEditorValue : function(cellEditor) {
      return cellEditor.getChecked();
    }
  }
});
