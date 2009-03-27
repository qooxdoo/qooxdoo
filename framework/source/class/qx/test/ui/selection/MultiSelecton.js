/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.MultiSelecton",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __list : null,
    
    __selection : null,
    
    setUp : function()
    {
      var length = 10;
      this.__selection = [];
      
      this.__list = new qx.ui.form.List();
      this.__list.setSelectionMode("multi");
      
      var selection = this.__list.getSelection();
      this.assertIdentical(selection.length, 0, 
        "Couldn't setup test, because selection isn't empty");
      
      for (var i = 0; i < length; i++) {
        var item = new qx.ui.form.ListItem("ListItem" + i);
        this.__list.add(item);
        
        if (i % 2 == 0) {
          this.__list.addToSelection(item);
          this.__selection[i / 2] = item;
        }
      } 
    },

    tearDown : function() {
      this.__list.destroy();
      this.__list = null;
      this.__selection = null;
    },

    testGetSelection : function()
    {
      var result = this.__list.getSelection();
      this.__assertArrayEquals(this.__selection, result, "Selection is wrong");
    },
    
    testSetSelection : function()
    {
      // Sets up the new selection
      this.__selection = [];
      this.__selection[0] = this.__list.getChildren()[1];
      this.__selection[1] = this.__list.getChildren()[3];
      this.__selection[2] = this.__list.getChildren()[5];
      this.__selection[3] = this.__list.getChildren()[7];
      this.__selection[4] = this.__list.getChildren()[9];
      
      // Tests the event and sets the new selection
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.setSelection(self.__selection);
      }, function(event) {
        // Tests the result from the event
        var data = event.getData();
        self.__assertArrayEquals(self.__selection, data, "Selection is wrong");
      }, "'changeSelection' event not fired!");
      
      // A second selection with the same elements shouldn't fire a event
      this.assertEventNotFired(list, "changeSelection", function () {
        list.setSelection(self.__selection);
      }, function(event) {}, "'changeSelection' event fired!");
      
      // Tests the result from "getSelection"
      var result = this.__list.getSelection();
      this.__assertArrayEquals(this.__selection, result, "Selection is wrong");
      
      // Tests that items which are not in the list isn't selected
      var testElement1 = new qx.ui.form.ListItem("Test Element1");
      var testElement2 = new qx.ui.form.ListItem("Test Element1");
      var testElements = [testElement1, this.__selection[0], testElement2];
      
      this.__list.setSelection(testElements);
      var expected = [this.__selection[0]];
      
      this.__assertArrayEquals(expected, this.__list.getSelection(), 
        "This element isn't in the list, so it isn't possible to select it.");
      
      testElement1.destroy();
      testElement2.destroy();
    },
    
    testSetSelectionOverrideWithLess : function()
    {
      // Sets up the new selection
      this.__selection = [];
      this.__selection[0] = this.__list.getChildren()[0];
      this.__selection[1] = this.__list.getChildren()[1];
      this.__selection[2] = this.__list.getChildren()[2];
      this.__selection[3] = this.__list.getChildren()[3];
      this.__selection[4] = this.__list.getChildren()[4];
      this.__list.setSelection(this.__selection);
      
      // Test setSelection() with the same elements, but less
      var expected = [this.__selection[0], this.__selection[2],
        this.__selection[4]];
      this.__list.setSelection(expected);
        
      // Tests the result from "getSelection"
      var result = this.__list.getSelection();
      this.__assertArrayEquals(expected, result, "Selection is wrong");
      
      // Test setSelection(), with one element from the selection before
      this.__list.setSelection(this.__selection);
      this.__list.setSelected(this.__selection[0]);
      result = this.__list.getSelection();
      expected = [this.__selection[0]];
      this.__assertArrayEquals(expected, result, "Selection is wrong");
    },
    
    testResetSelection : function()
    {
      // Tests event and resets the selection
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.resetSelection();
      }, function(event) {
        // Tests the result from the event
        self.assertEquals(0, event.getData().length, "Event isn't empty");
      }, "'changeSelection' event not fired!");
      
      // Tests the result from "getSelection"
      var result = this.__list.getSelection();
      this.assertIdentical(result.length, 0, 
        "Reset selection doesn't work");
    },
    
    testIsSelected : function()
    {
      // Tests that a selected item is selected.
      var result = this.__list.isSelected(this.__selection[0]);
      this.assertTrue(result, "The wrong item is selected");
      
      // Tests that a not selected item isn't selected.
      result = this.__list.isSelected(this.__list.getChildren()[1]);
      this.assertFalse(result, "The wrong item is selected");
      
      // Tests that a item which isn't in the list isn't selected.
      var testElement = new qx.ui.form.ListItem("Test Element");
      result = this.__list.isSelected(testElement);
      this.assertFalse(result, "The item is selected, but it isn't in the list");
      testElement.destroy();
    },
    
    testIsSelectionEmpty : function()
    {
      // Tests that the first selection isn't empty.
      var result = this.__list.isSelectionEmpty();
      this.assertFalse(result, "The selection is empty");
      
      // Resets the selection
      this.__list.resetSelection();
      
      // Tests that the selection is empty.
      result = this.__list.isSelectionEmpty();
      this.assertTrue(result, "The selection isn't empty");
    },
    
    testSelectAll : function()
    {
      // Resets the selection to compare the results.
      this.__list.resetSelection();
      
      // Tests event and select all items
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.selectAll();
      }, function(event) {
        // Tests the result from the event
        self.__assertArrayEquals(list.getChildren(), event.getData(),
          "Selection is wrong A");
      }, "'changeSelection' event not fired!");
      
      // A second selectAll() shouldn't fire a event
      this.assertEventNotFired(list, "changeSelection", function () {
        list.selectAll();
      }, function(event) {}, "'changeSelection' event fired!");
      
      this.__list.selectAll();
      
      // Tests the result from "getSelection"
      this.__selection = this.__list.getSelection();
      this.__assertArrayEquals(this.__list.getChildren(), this.__selection,
        "Selection is wrong B");
    },
    
    testAddToSelection : function()
    {
      // Sets up a new item for selection
      var newValue = this.__list.getChildren()[3];
      this.__selection[this.__selection.length] = newValue;
      
      // Tests event and adds item to the selection
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.addToSelection(newValue);
      }, function(event) {
        // Tests the result from the event        
        self.__assertArrayEquals(self.__selection, event.getData(), 
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");
      
      // A second selection shouldn't fire a event
      this.assertEventNotFired(list, "changeSelection", function () {
        list.addToSelection(newValue);
      }, function(event) {}, "'changeSelection' event fired!");
      
      // Tests the result from "getSelection"
      this.__assertArrayEquals(this.__selection, this.__list.getSelection(),
        "Selection is wrong");
        
      // Tests that a item which isn't in the list, isn't selected.
      var testElement = new qx.ui.form.ListItem("Test Element");
      this.__list.addToSelection(testElement);
      this.__assertArrayEquals(this.__selection, this.__list.getSelection(),
        "This element isn't in the list, so it isn't possible to select it.");
      testElement.destroy();
    },
    
    testRemoveFromSelection : function()
    {
      // Sets up the item to remove
      var itemToRemovet = this.__selection[this.__selection.length - 1];
      
      // Tests event and removes the item
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.removeFromSelection(itemToRemovet);
      }, function(event) {

        // Updates the selection array
        delete self.__selection[self.__selection.length - 1];
        self.__selection.length = self.__selection.length - 1;
        
        // Tests the result from the event
        self.__assertArrayEquals(self.__selection, event.getData(), "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");
      
      // Tests the result from "getSelection"
      this.__assertArrayEquals(this.__selection, this.__list.getSelection(),
        "Selection is wrong");
        
      // Tests that a item which isn't in the list, isn't removed
      var testElement = new qx.ui.form.ListItem("Test Element");
      this.__list.removeFromSelection(testElement);
      this.__assertArrayEquals(this.__selection, this.__list.getSelection(),
        "This element isn't in the list, so it isn't possible to select it.");
      testElement.destroy();
    },
    
    testGetSelectables : function()
    {
      var selectables = [];
      var items = this.__list.getChildren();
      
      for (var i = 0; i < items.length; i++)
      {
        if (i % 2 == 0) {
          selectables.push(items[i]);
        } else {
          items[i].setEnabled(false);
        }
      }
      
      this.__assertArrayEquals(selectables, this.__list.getSelectables(), 
        "This list of the returned selectables are wrong");
    },
    
    __assertArrayEquals : function(expected, found, message)
    {
      expected.sort();
      found.sort();
      this.assertArrayEquals(expected, found, message);
    }
  }
});
