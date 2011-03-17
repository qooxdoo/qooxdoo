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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.AbstractMultiSelectonTest",
{
  extend : qx.test.ui.selection.AbstractSingleSelectonTest,
  type : "abstract",

  members :
  {
    testSetSelectionWithTooMuchElements : function()
    {
      // Do nothing
    },

    // overridden
    testSetSelection : function()
    {
      this.base(arguments);

      // Sets up the new selection
      var selection = [];
      selection[0] = this._notInSelection[0];
      selection[1] = this._notInSelection[1];
      selection[2] = this._notInSelection[2];
      selection[3] = this._notInSelection[3];
      selection[4] = this._notInSelection[4];

      this._testSetSelection(selection);
      this.flush();
    },

    testSetSelectionOverrideWithLess : function()
    {
      // Sets up the new selection
      this._selection = [];
      this._selection[0] = this._notInSelection[0];
      this._selection[1] = this._notInSelection[1];
      this._selection[2] = this._notInSelection[2];
      this._selection[3] = this._notInSelection[3];
      this._selection[4] = this._notInSelection[4];
      this._widget.setSelection(this._selection);
      this.flush();

      // Test setSelection() with the same elements, but less
      var expected = [this._selection[0], this._selection[2],
        this._selection[4]];
      this._widget.setSelection(expected);

      // Tests the result from "getSelection"
      var result = this._widget.getSelection();
      this._assertArrayEquals(expected, result, "Selection is wrong");

      // Test setSelection(), with one element from the selection before
      this._widget.setSelection(this._selection);
      this._widget.setSelection([this._selection[0]]);
      result = this._widget.getSelection();
      expected = [this._selection[0]];
      this._assertArrayEquals(expected, result, "Selection is wrong");
      this.flush();
    },

    testSelectAll : function()
    {
      // Resets the selection to compare the results.
      this._widget.resetSelection();

      // Tests event and select all items
      var widget = this._widget;
      var that = this;
      this.assertEventFired(widget, "changeSelection", function () {
        widget.selectAll();
        that.flush();
      }, function(event) {
        // Tests the result from the event
        that._assertArrayEquals(that._getChildren(), event.getData(),
          "Selection is wrong!");
      }, "'changeSelection' event not fired!");

      // A second selectAll() shouldn't fire an event
      this.assertEventNotFired(widget, "changeSelection", function () {
        widget.selectAll();
      }, function(event) {}, "'changeSelection' event fired!");

      // Tests the result from "getSelection"
      this._selection = this._widget.getSelection();
      this._assertArrayEquals(this._getChildren(), this._selection,
        "Selection is wrong!");
    },

    testAddToSelection : function()
    {
      // Sets up a new item for selection
      var newValue = this._notInSelection[0];
      this._selection[this._selection.length] = newValue;

      // Tests event and adds item to the selection
      var widget = this._widget;
      var that = this;
      this.assertEventFired(widget, "changeSelection", function () {
        widget.addToSelection(newValue);
        that.flush();
      }, function(event) {
        // Tests the result from the event
        that._assertArrayEquals(that._selection, event.getData(),
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");

      // A second selection shouldn't fire an event
      this.assertEventNotFired(widget, "changeSelection", function () {
        widget.addToSelection(newValue);
      }, function(event) {}, "'changeSelection' event fired!");

      // Tests the result from "getSelection"
      this._assertArrayEquals(this._selection, this._widget.getSelection(),
        "Selection is wrong");
    },

    testAddToSelectionWithNotChildElement : function()
    {
      var that = this;
      var testElement = this._createTestElement("Test Element");

      this.assertException(function() {
        that._widget.addToSelection(testElement);
      }, Error, null, "No error occurs by trying to add an element" +
        " to the selection which isn't a child element!");

      testElement.destroy();
    },

    testRemoveFromSelection : function()
    {
      // Sets up the item to remove and update the selection array
      var selection = this._selection
      var itemToRemove = selection[selection.length - 1];
      delete selection[selection.length - 1];
      selection.length = selection.length - 1;

      // Tests event and removes the item
      var widget = this._widget;
      var that = this;
      this.assertEventFired(widget, "changeSelection", function () {
        widget.removeFromSelection(itemToRemove);
        that.flush();
      }, function(event) {
        // Tests the result from the event
        that._assertArrayEquals(that._selection, event.getData(),
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");

      // Tests the result from "getSelection"
      this._assertArrayEquals(this._selection, this._widget.getSelection(),
        "Selection is wrong");
    },

    testRemoveFromSelectionWithNotChildElement : function()
    {
      var that = this;
      var testElement = this._createTestElement("Test Element");

      this.assertException(function() {
        that._widget.removeFromSelection(testElement);
      }, Error, null, "No error occurs by trying to remove an element" +
        " which isn't a child element!");

      testElement.destroy();
    },

    testRemoveFromSelectionWithNotSelectedElement : function()
    {
      var itemToRemove = this._notInSelection[0];

      var widget = this._widget;
      this.assertEventNotFired(widget, "changeSelection", function () {
        widget.removeFromSelection(itemToRemove);
      }, function(event) {}, "'changeSelection' event fired!");
    },

    testInvertSelection : function()
    {
      var that = this;
      var widget = this._widget;
      this.assertEventFired(widget, "changeSelection", function () {
        widget.invertSelection();
        that.flush();
      }, function(event) {
        // Tests the result from the event
        that._assertArrayEquals(that._notInSelection, event.getData(),
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");

      // Tests the result from "getSelection"
      this._assertArrayEquals(this._notInSelection, this._widget.getSelection(),
        "Selection is wrong");
    },

    testInvertSelectionWithErrors : function()
    {
      var widget = this._widget;
      widget.setSelectionMode("single");

      this.assertException(function() {
        widget.invertSelection();
      }, Error, null, "No error occurs by trying to invert elements" +
        " in 'single' selection mode!");
    },

    testInvertSelectionWithDisabledChildElements : function()
    {
      // test setup
      var tempNotInSelection = [];
      for (var i = 0; i < this._notInSelection.length; i++) {
        tempNotInSelection.push(this._notInSelection[i]);
      }
      this._notInSelection = tempNotInSelection;

      var that = this;
      var widget = this._widget;
      this.assertEventFired(widget, "changeSelection", function () {
        widget.invertSelection();
        that.flush();
      }, function(event) {
        // Tests the result from the event
        that._assertArrayEquals(that._notInSelection, event.getData(),
          "The result of the selection is wrong");
      }, "'changeSelection' event not fired!");

      // Tests the result from "getSelection"
      this._assertArrayEquals(this._notInSelection, this._widget.getSelection(),
        "Selection is wrong");
    }
  }
});
