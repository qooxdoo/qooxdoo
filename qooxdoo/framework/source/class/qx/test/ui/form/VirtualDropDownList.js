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

/* ************************************************************************

#ignore(qx.ui.form.AbstractVirtualPopupListMock)

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


    testException : function()
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
    },


    testCreation : function()
    {
      var model = this.__dropdown.getChildControl("list").getModel();

      this.assertEquals(this.__model.getLength(), model.getLength(), "Model length not equals!");
      this.assertEquals(this.__model, model, "Model instance not equals!");

      this.__checkSelection(0);
    },


    testSelection : function()
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.__checkEvent(selection, function() {
        selection.push(that.__model.getItem(2));
      });

      this.__checkSelection(2);
    },


    testSelectFirst : function()
    {
      var selection = this.__dropdown.getSelection();
      selection.push(this.__model.getItem(2));

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectFirst();
      });

      this.__checkSelection(0);

      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectFirst();
      });

      this.__checkSelection(0);
    },


    testSelectLast : function()
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectLast();
      });

      this.__checkSelection(this.__model.getLength() - 1);

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectLast();
      });

      this.__checkSelection(this.__model.getLength() - 1);
    },


    testSelectPrevious : function()
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectPrevious();
      });

      this.__checkSelection(0);

      var index = 1;
      selection.push(this.__model.getItem(index));

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectPrevious();
      });

      this.__checkSelection(index - 1);
    },


    testSelectNext : function()
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectNext();
      });

      this.__checkSelection(1);

      var index = this.__model.getLength() - 1;
      selection.push(this.__model.getItem(index));

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectNext();
      });

      this.__checkSelection(index);
    },


    __createModelData : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + (i + 1));
      }

      return model;
    },


    __checkSelection : function(modelIndex)
    {
      var selection = this.__dropdown.getSelection();
      var listSelection = this.__dropdown.getChildControl("list").getSelection();

      this.assertEquals(1, selection.getLength(), "Selection length not equals!");
      this.assertEquals(this.__model.getItem(modelIndex), selection.getItem(0), "Selection instance not equals!");

      this.assertEquals(selection.getLength(), listSelection.getLength(), "Selection length not equals with list selection length!");
      this.assertEquals(selection.getItem(0), listSelection.getItem(0), "Selection instance not equals with list selection instance!");
    },


    __checkEvent : function(target, callback)
    {
      var count = 0;
      this.assertEventFired(target, "change", callback, function() {
        count++;
      });
      this.assertEquals(1, count, "The event is fired more than once!");
    }
  },


  destruct : function() {
    qx.Class.undefine("qx.ui.form.AbstractVirtualPopupListMock");
  }
});