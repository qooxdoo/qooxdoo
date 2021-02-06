/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.list.core.SingleSelection",
{
  extend : qx.test.ui.list.AbstractListTest,

  members :
  {
    createModelData : function()
    {
      var model = new qx.data.Array();

      for (var i = 0; i < 100; i++) {
        model.push("item " + i);
      }

      return model;
    },

    testSelection : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(1));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");
      var expectedSelection = new qx.data.Array([this._model.getItem(1)]);
      this.assertDataArrayEquals(selection, expectedSelection, "On List");
      expectedSelection.dispose();

      // check selection from manager
      var item = this._list._manager.getSelectedItem();
      item = this._list._getDataFromRow(item);

      this.assertEquals(this._model.getItem(1), item);
    },

    testInvalidSelection : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(1));
      selection.push(this._model.getItem(2));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");
      var expectedSelection = new qx.data.Array([this._model.getItem(2)]);
      this.assertDataArrayEquals(selection, expectedSelection, "On List");
      expectedSelection.dispose();

      // check selection from manager
      var selection = this._list._manager.getSelection();

      this.assertEquals(1, selection.length);
      this.assertEquals(2, selection[0]);
    },

    testSelectionByUserInteraction : function()
    {
      var selection = this._list.getSelection();

      this._list._manager.selectItem(2);
      this.flush();

      this.assertEquals(1, selection.getLength());
      this.assertEquals(this._model.getItem(2), selection.getItem(0));
      this.assertEquals(2, this._list._manager.getSelectedItem());
    },

    testSelectionEventByUserInteraction : function()
    {
      var selection = this._list.getSelection();

      var self = this;
      this.assertEventFired(selection, "change",
        function()
        {
          self._list._manager.selectItem(2);
          self.flush();
        },
        function(e)
        {
          self.assertEquals(1, selection.getLength());
          self.assertEquals(self._model.getItem(2), selection.getItem(0));
          self.assertEquals(2, self._list._manager.getSelectedItem());
        }
      );
    },

    testSelectionWithSorter : function()
    {
      this._list.setDelegate({
        sorter : function(a, b) {
          return a < b ? 1 : a > b ? -1 : 0;
        }
      });

      this.testSelection();
    },

    testSelectionWithFilter : function() {
      this._list.setDelegate({
        filter : function(data) {
          // Filters all even items
          return ((parseInt(data.slice(5, data.length), 10)) % 2 == 1);
        }
      });

      var selection = this._list.getSelection();
      selection.push(this._model.getItem(1));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");
      var expectedSelection = new qx.data.Array([this._model.getItem(1)]);
      this.assertDataArrayEquals(selection, expectedSelection, "On List");
      expectedSelection.dispose();

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(1, selection.length);
      this.assertEquals(0, selection[0]);
    },

    testInvalidSelectionWithFilter : function() {
      this._list.setDelegate({
        filter : function(data) {
          // Filters all even items
          return ((parseInt(data.slice(5, data.length), 10)) % 2 == 1);
        }
      });

      var selection = this._list.getSelection();
      selection.push(this._model.getItem(0));
      this.flush();

      // check selection from list
      this.assertEquals(0, this._list.getSelection().getLength(), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(0, selection.length);
    },

    testApplyFilterAfterSelection : function() {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(0));
      this.flush();

      this._list.setDelegate({
        filter : function(data) {
          // Filters all even items
          return ((parseInt(data.slice(5, data.length), 10)) % 2 == 1);
        }
      });
      this.flush();

      // check selection from list
      this.assertEquals(0, this._list.getSelection().getLength(), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(0, selection.length, "On Manager");
    },

    testApplySortingAfterSelection : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(0));
      this.flush();

      // check selection from list
      this.assertEquals(1, this._list.getSelection().getLength(), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(1, selection.length, "On Manager");

      this._list.setDelegate({
        sorter : function(a, b) {
          return a < b ? 1 : a > b ? -1 : 0;
        }
      });
      this.flush();

      // check selection from list
      var expectedSelection = new qx.data.Array([this._model.getItem(0)]);
      this.assertDataArrayEquals(expectedSelection, this._list.getSelection(), "On List");
      expectedSelection.dispose();

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(1, selection.length, "On Manager");

      // check row == last index
      this.assertEquals(this._model.getLength() - 1, this._list._manager.getSelection()[0], "Row is wrong on Manager");
    },

    testRemoveItem : function()
    {
      var selection = this._list.getSelection();
      selection.push(this._model.getItem(0));
      this.flush();

      this._model.removeAt(0);
      this.flush();

      // check selection from list
      this.assertEquals(0, this._list.getSelection().getLength(), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(0, selection.length, "On Manager");
    },

    testRemoveItemWithGrouping : function()
    {
      this._list.setDelegate({
        group : function(data) {
          return data;
        }
      });

      var lastIndex = this._model.getLength() - 1;

      var selection = this._list.getSelection();
      selection.push(this._model.getItem(lastIndex));
      this.flush();

      this._model.removeAt(lastIndex);
      this.flush();

      // check selection from list
      this.assertEquals(0, this._list.getSelection().getLength(), "On List");

      // check selection from manager
      var selection = this._list._manager.getSelection();
      this.assertEquals(0, selection.length, "On Manager");
    }
  }
});
