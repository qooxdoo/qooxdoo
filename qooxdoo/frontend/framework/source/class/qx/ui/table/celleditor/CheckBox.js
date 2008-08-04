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

/**
 * For editing boolean data in a checkbox. It is advisable to use this in
 * conjuntion with {@link qx.ui.table.cellrenderer.Boolean}.
 */
qx.Class.define("qx.ui.table.celleditor.CheckBox",
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
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // interface implementation
    createCellEditor : function(cellInfo)
    {
      var editor = new qx.ui.container.Composite(new qx.ui.layout.HBox().set({
        alignX: "center",
        alignY: "middle"
      })).set({
        focusable: true
      });

      var checkbox = new qx.ui.form.CheckBox().set({
        checked: cellInfo.value
      });
      editor.add(checkbox);

      // propagate focus
      editor.addListener("focus", function() {
        checkbox.focus();
      });

      // propagate active state
      editor.addListener("activate", function() {
        checkbox.activate();
      });

      // propagate stopped enter key press to the editor
      checkbox.addListener("keydown", function(e)
      {
        if (e.getKeyIdentifier() == "Enter")
        {
          var clone = qx.event.Pool.getInstance().getObject(qx.event.type.KeySequence);
          var target = editor.getContainerElement().getDomElement();
          clone.init(e.getNativeEvent(), target, e.getKeyIdentifier());
          clone.setType("keypress");
          qx.event.Registration.dispatchEvent(target, clone);
        }
      }, this);

      return editor;
    },

    // interface implementation
    getCellEditorValue : function(cellEditor) {
      return cellEditor.getChildren()[0].getChecked();
    }
  }
});
