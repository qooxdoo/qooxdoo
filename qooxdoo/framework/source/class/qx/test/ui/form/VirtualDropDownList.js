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
      var model = this.__model;
      var listModel = this.__dropdown.getChildControl("list").getModel();

      this.assertEquals(model, listModel, "Model instance not equals!");

      this.__testCreation(model);
    },


    testCreationWithSorter : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testCreation(sortedModel);
    },


    __testCreation : function(model)
    {
      var listModel = this.__dropdown.getChildControl("list").getModel();

      this.assertEquals(model.getLength(), listModel.getLength(), "Model length not equals!");

      this.__checkSelection(model.getItem(0));
    },


    testSelection : function()
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      var newItem = this.__model.getItem(2);
      this.__checkEvent(selection, function() {
        selection.push(newItem);
      }, 2);

      this.__checkSelection(newItem);


      var that = this;
      newItem = this.__model.getItem(4);
      this.__checkEvent(selection, function() {
        selection.splice(0, 1, newItem);
      }, 1);

      this.__checkSelection(newItem);
    },


    testSelectFirst : function() {
      this.__testSelectFirst(this.__model);
    },


    testSelectFirstWithSorter : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testSelectFirst(sortedModel);
    },


    __testSelectFirst : function(model) {
      var selection = this.__dropdown.getSelection();
      selection.push(model.getItem(2));

      var that = this;
      var newItem = model.getItem(0);
      this.__checkEvent(selection, function() {
        that.__dropdown.selectFirst();
      }, 1);

      this.__checkSelection(newItem);

      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectFirst();
      });

      this.__checkSelection(newItem);
    },


    testSelectLast : function() {
      this.__testSelectLast(this.__model);
    },


    testSelectLastWithSorting : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testSelectLast(sortedModel);
    },


    __testSelectLast : function(model)
    {
      var selection = this.__dropdown.getSelection();
      selection.push(model.getItem(2));

      var that = this;
      var newItem = model.getItem(model.getLength() - 1);
      this.__checkEvent(selection, function() {
        that.__dropdown.selectLast();
      }, 1);

      this.__checkSelection(newItem);

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectLast();
      });

      this.__checkSelection(newItem);
    },


    testSelectPrevious : function() {
      this.__testSelectPrevious(this.__model);
    },


    testSelectPreviousWithSorter : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testSelectPrevious(sortedModel);
    },


    __testSelectPrevious : function(model)
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectPrevious();
      });

      this.__checkSelection(model.getItem(0));

      var index = 1;
      selection.push(model.getItem(index));

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectPrevious();
      }, 1);

      this.__checkSelection(model.getItem(index - 1));
    },


    testSelectNext : function() {
      this.__testSelectNext(this.__model);
    },


    testSelectNextWithSorter : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testSelectNext(sortedModel);
    },


    __testSelectNext : function(model)
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      this.__checkEvent(selection, function() {
        that.__dropdown.selectNext();
      }, 1);

      this.__checkSelection(model.getItem(1));

      var index = model.getLength() - 1;
      selection.push(model.getItem(index));

      var that = this;
      this.assertEventNotFired(selection, "change", function() {
        that.__dropdown.selectNext();
      });

      this.__checkSelection(model.getItem(index));
    },


    __createModelData : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + (i + 1));
      }

      return model;
    },


    __checkSelection : function(item)
    {
      this.assertTrue(this.__model.contains(item), "The itme '" + item + "' is not in the model!");
      var modelIndex = this.__model.indexOf(item);

      var selection = this.__dropdown.getSelection();
      var listSelection = this.__dropdown.getChildControl("list").getSelection();

      this.assertEquals(1, selection.getLength(), "Selection length not equals!");
      this.assertEquals(this.__model.getItem(modelIndex), selection.getItem(0), "Selection instance not equals!");

      this.assertEquals(selection.getLength(), listSelection.getLength(), "Selection length not equals with list selection length!");
      this.assertEquals(selection.getItem(0), listSelection.getItem(0), "Selection instance not equals with list selection instance!");
    },


    __checkEvent : function(target, callback, fired)
    {
      var count = 0;
      this.assertEventFired(target, "change", callback, function() {
        count++;
      });
      this.assertEquals(fired, count, "The event is not fired the expected times!");
    },


    __applySortingAndReturnSortedModel : function()
    {
      var sorter = function(a, b) {
        return a < b ? 1 : a > b ? -1 : 0;
      };

      this.__dropdown.getChildControl("list").setDelegate({sorter : sorter});

      var sortedModel = this.__model.copy();
      sortedModel.sort(sorter);

      return sortedModel;
    }
  },


  destruct : function() {
    qx.Class.undefine("qx.ui.form.AbstractVirtualPopupListMock");
  }
});