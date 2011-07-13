/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.form.virtual.VirtualSelectBox",
{
  extend : qx.test.ui.LayoutTestCase,


  members :
  {
    __selectBox : null,


    setUp : function()
    {
      this.base(arguments);

      this.__model = this.__createModelData();
      this.__selectBox = new qx.ui.form.VirtualSelectBox(this.__model);
      this.getRoot().add(this.__selectBox);

      this.flush();
    },


    tearDown : function()
    {
      this.base(arguments);

      this.__selectBox.destroy();
      this.__selectBox = null;
      this.__model.dispose();
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


    testCreation : function()
    {
      this.assertEquals(this.__model.getLength(), this.__selectBox.getModel().getLength(), "Model length not equals!");
      this.assertEquals(this.__model, this.__selectBox.getModel(), "Model instance not equals!");
      this.assertEquals(this.__model, this.__selectBox.getChildControl("dropdown").getChildControl("list").getModel(), "Model instance on list not equals!");

      this.assertEquals(1, this.__selectBox.getSelection().getLength(), "Selection length not equals!");
      this.assertEquals(this.__model.getItem(0), this.__selectBox.getSelection().getItem(0), "Selection instance not equals!");
    }
  }
});