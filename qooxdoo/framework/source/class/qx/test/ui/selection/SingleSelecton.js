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

qx.Class.define("qx.test.ui.selection.SingleSelecton",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __list : null,
    
    __selected : null,
    
    setUp : function()
    {
      var length = 10;
      
      this.__list = new qx.ui.form.List();
      
      for (var i = 0; i < length; i++) {
        var item = new qx.ui.form.ListItem("ListItem" + i);
        this.__list.add(item);
        
        if (i == 5) {
          this.assertNull(this.__list.getSelected(), 
            "Couldn't setup test, because selection isn't empty");
          
          this.__list.setSelected(item);
          this.__selected = item;
        }
      }   
    },

    tearDown : function() {
      this.__list.destroy();
      this.__list = null;
      this.__selected = null;
    },

    testGetSelected : function()
    {
      var result = this.__list.getSelected();
      this.assertEquals(result, this.__selected,
        "The result of the selection is wrong");
    },
    
    testSetSelected : function()
    {
      // Tests event and sets the selection
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        self.__selected = list.getChildren()[0];
        list.setSelected(self.__selected);
      }, function(event) {
        // Tests the value from the event
        self.assertEquals(event.getData()[0], self.__selected,
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");
      
      // A second selection with the same element shouldn't fire a event
      this.assertEventNotFired(list, "changeSelection", function () {
        self.__selected = list.getChildren()[0];
        list.setSelected(self.__selected);
      }, function(event) {}, "'changeSelection' event fired!");
      
      // Tests result from "getSelected"
      var result = this.__list.getSelected();
      this.assertEquals(result, this.__selected,
        "The result of the selection is wrong");
      
      // Tests that a item which isn't in the list, isn't selected.
      var testElement = new qx.ui.form.ListItem("Test Element");
      this.__list.setSelected(testElement);
      this.assertEquals(this.__selected, this.__list.getSelected(), 
        "This element isn't in the list, so it isn't possible to select it.");
      testElement.destroy();
    },
    
    testResetSelected : function()
    {
      // Tests event and resets selection
      var list = this.__list;
      var self = this;
      this.assertEventFired(list, "changeSelection", function () {
        list.resetSelection();
      }, function(event) {
        // Tests the value from the event
        self.assertEquals(0, event.getData().length, "Event isn't empty");
      }, "'changeSelection' event not fired!");
      
      // Tests result from "getSelected"
      var result = this.__list.getSelected();
      this.assertNull(result, "The result isn't empty");
    },
    
    testIsSelected : function()
    {
      // Tests that the selected item is selected.
      var result = this.__list.isSelected(this.__selected);
      this.assertTrue(result, "The wrong item is selected");
      
      // Tests that a not selected item isn't selected.
      this.__selected = this.__list.getChildren()[0];
      result = this.__list.isSelected(this.__selected);
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
      
      selectables.sort();
      var found = this.__list.getSelectables();
      found.sort();
      this.assertArrayEquals(selectables, found, 
        "This list of the returned selectables are wrong");
    }
  }
});
