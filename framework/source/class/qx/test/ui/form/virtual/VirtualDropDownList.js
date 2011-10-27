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

#ignore(qx.ui.form.core.AbstractVirtualBoxMock)

************************************************************************ */

qx.Class.define("qx.test.ui.form.virtual.VirtualDropDownList",
{
  extend : qx.test.ui.LayoutTestCase,
  include : qx.test.ui.list.MAssert,


  construct : function()
  {
    this.base(arguments);

    qx.Class.define("qx.ui.form.core.AbstractVirtualBoxMock", {
      extend : qx.ui.form.core.AbstractVirtualBox,

      members :
      {
        _addBindings : function() {},

        _removeBindings : function() {}
      }
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

      this.__target = new qx.ui.form.core.AbstractVirtualBoxMock();
      this.__dropdown = new qx.ui.form.core.VirtualDropDownList(this.__target);

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
      this.__model.dispose();
      this.__model = null;
    },


    testException : function()
    {
      this.assertException(function() {
        new qx.ui.form.core.VirtualDropDownList();
      }, Error, "Invalid parameter 'target'!");

      this.assertException(function() {
        new qx.ui.form.core.VirtualDropDownList(null);
      }, Error, "Invalid parameter 'target'!");

      var widget = new qx.ui.core.Widget()
      this.assertException(function() {
        new qx.ui.form.core.VirtualDropDownList(widget);
      }, Error, "Invalid parameter 'target'!");
      widget.dispose();
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
      sortedModel.dispose();
    },


    testCreationWithFilter : function()
    {
      var filteredModel = this.__applyFilterAndReturnFilteredModel();
      this.__testCreation(filteredModel);
      filteredModel.dispose();
    },


    __testCreation : function(model)
    {
      var list = this.__dropdown.getChildControl("list");

      this.assertModelEqualsRowData(model, list);

      this.__checkSelection(model.getItem(0));
    },


    testSelection : function()
    {
      this.__testSelection(this.__model);
    },


    testSelectionWithSorter : function()
    {
      var sortedModel = this.__applySortingAndReturnSortedModel();
      this.__testSelection(sortedModel);
      sortedModel.dispose();
    },


    testSelectionWithFilter : function()
    {
      var filteredModel = this.__applyFilterAndReturnFilteredModel();
      this.__testCreation(filteredModel);

      var model = this.__model;
      var selection = this.__dropdown.getSelection();

      var invalidItem = model.getItem(2);
      this.assertFalse(filteredModel.contains(invalidItem));

      var that = this;
      this.__checkEvent(selection, function() {
        selection.push(invalidItem);
      }, 2);

      this.__checkSelection(filteredModel.getItem(0));
      filteredModel.dispose();
    },


    __testSelection : function(model)
    {
      var selection = this.__dropdown.getSelection();

      var that = this;
      var newItem = model.getItem(2);
      this.__checkEvent(selection, function() {
        selection.push(newItem);
      }, 2);

      this.__checkSelection(newItem);


      var that = this;
      newItem = model.getItem(4);
      this.__checkEvent(selection, function() {
        selection.splice(0, 1, newItem).dispose();
      }, 1);

      this.__checkSelection(newItem);
    },


    __createModelData : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + (i));
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

      this.__dropdown.getChildControl("list").setDelegate({sorter: sorter});

      var sortedModel = this.__model.copy();
      sortedModel.sort(sorter);

      return sortedModel;
    },


    __applyFilterAndReturnFilteredModel : function()
    {
      var filter = function(data) {
        // Filters all even items
        return ((parseInt(data.slice(5, data.length), 10)) % 2 == 1);
      };
      this.__dropdown.getChildControl("list").setDelegate({filter: filter});

      var filteredModel = new qx.data.Array();
      for (var i = 0; i < this.__model.getLength(); i++)
      {
        var item = this.__model.getItem(i);
        if (filter(item)) {
          filteredModel.push(item);
        }
      }

      return filteredModel;
    }
  },


  destruct : function() {
    qx.Class.undefine("qx.ui.form.core.AbstractVirtualBoxMock");
  }
});