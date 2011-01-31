/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

************************************************************************ */

qx.Class.define("qx.test.ui.form.VirtualComboBox",
{

  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __comboBox : null,


    setUp : function()
    {
      this.base(arguments);

      this.__model = this.__createModelData();
      this.__comboBox = new qx.ui.form.VirtualComboBox(this.__model);
      this.getRoot().add(this.__comboBox);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);

      this.__comboBox.destroy();
      this.__comboBox = null;
      this.__model = null;
    },

    __createModelData : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + (i + 1));
      }

      return model;
    },

    testSelectFirstMatch : function()
    {
      this.__comboBox.setValue("item 42");
      this.__comboBox.open();
      var list = this.__comboBox.getChildControl("dropdown");
      var listSelectionValue = list.getSelection().getItem(0);
      this.assertEquals("item 42", listSelectionValue);
    }
  }

});