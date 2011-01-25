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
qx.Class.define("qx.test.ui.form.VirtualDropDownList",
{
  extend : qx.test.ui.LayoutTestCase,

  
  construct : function()
  {
    this.base(arguments);
    
    qx.Class.define("qx.ui.form.AbstractVirtualPopupListMock", {
      extend : qx.ui.form.AbstractVirtualPopupList
    });
  },
  
  members :
  {
    __target : null,
    __dropdown : null,
    __model : null,
    
    setUp : function()
    {
      this.base(arguments);
      
      this.__target = new qx.ui.form.AbstractVirtualPopupListMock();
      this.__dropdown = new qx.ui.form.VirtualDropDownList(this.__target);
      
      this.__model = this.__createModelData();
      this.__dropdown.getChildControl("list").setModel(this.__model);
      
      this.getRoot().add(this.__target);
    },
    
    tearDown : function()
    {
      this.base(arguments);
      
      this.__target.destroy();
      this.__dropdown.destroy();
      this.__target = null;
      this.__dropdown = null;
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
      this.assertException(function() {
        new qx.ui.form.VirtualDropDownList();
      }, Error, "Invalid parameter 'target'!");
      
      this.assertException(function() {
        new qx.ui.form.VirtualDropDownList(null);
      }, Error, "Invalid parameter 'target'!");
      
      this.assertException(function() {
        new qx.ui.form.VirtualDropDownList(new qx.ui.core.Widget());
      }, Error, "Invalid parameter 'target'!");
      
      this.assertEquals(this.__model.getLength(), this.__dropdown.getChildControl("list").getModel().getLength(), "Model length not equals!");
      this.assertEquals(this.__model, this.__dropdown.getChildControl("list").getModel(), "Model instance not equals!");
      this.assertEquals(this.__model, this.__dropdown.getChildControl("list").getModel(), "Model instance on list not equals!");
      
      this.assertEquals(1, this.__dropdown.getSelection().getLength(), "Selection length not equals!");
      this.assertEquals(this.__model.getItem(0), this.__dropdown.getSelection().getItem(0), "Selection instance not equals!");
    }
  },
  
  destruct : function() {
    qx.Class.undefine("qx.ui.form.AbstractVirtualPopupListMock");
  }
});