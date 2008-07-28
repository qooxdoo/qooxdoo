/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/32/actions/go-previous.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-up.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-next.png)
#asset(qx/icon/${qx.icontheme}/32/actions/go-down.png)

#asset(qx/icon/${qx.icontheme}/32/apps/internet-feed-reader.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.table.CellEditor",
{
  extend : qx.application.Standalone,
  include : [demobrowser.demo.table.MUtil],

  members :
  {
    main: function()
    {
      this.base(arguments);

      this._container = new qx.ui.container.Composite(new qx.ui.layout.VBox(15)).set({
        padding: 20
      })
      this.getRoot().add(this._container);

      this.testCheckBoxEditor();
      this.testComboBoxEditor();
    },

    _addEditor : function(editorFactory, cellInfo)
    {
      var box = new qx.ui.container.Composite(new qx.ui.layout.HBox(20));

      var editor = editorFactory.createCellEditor(cellInfo);
      box.add(editor);

      var btnValue = new qx.ui.form.Button("Get value");
      box.add(btnValue);
      btnValue.addListener("execute", function() {
        label.setContent(editorFactory.getCellEditorValue(editor) + "");
      });

      var label = new qx.ui.basic.Label("");
      box.add(label);

      this._container.add(box);
    },

    testCheckBoxEditor : function()
    {
      var cellInfoOptions = {
        value : [true, false]
      }

      this.permute(cellInfoOptions, function(cellInfo) {
        this._addEditor(new qx.ui.table.celleditor.CheckBox(), cellInfo);
      }, this);
    },

    testComboBoxEditor : function()
    {
      var cellInfoOptions = {
        value : [true, false]
      }

      this.permute(cellInfoOptions, function(cellInfo) {
        this._addEditor(new qx.ui.table.celleditor.ComboBox(), cellInfo);
      }, this);
    }
  }
});
