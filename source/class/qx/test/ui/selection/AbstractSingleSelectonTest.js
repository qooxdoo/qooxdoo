/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

qx.Class.define("qx.test.ui.selection.AbstractSingleSelectonTest", {
  extend: qx.test.ui.LayoutTestCase,
  type: "abstract",

  members: {
    _widget: null,

    _mode: null,

    _selection: null,

    _notInSelection: null,

    _getChildren() {
      throw new Error("Abstract method call: _getChildren()");
    },

    _createTestElement(name) {
      throw new Error("Abstract method call: _createTestElement()");
    },

    _assertArrayEquals(expected, found, message) {
      expected.sort();
      found.sort();
      this.assertArrayEquals(expected, found, message);
    },

    testGetSelection() {
      var result = this._widget.getSelection();
      this._assertArrayEquals(
        this._selection,
        result,
        "The result of the selection is wrong"
      );
    },

    testSetSelection() {
      this._testSetSelection([this._notInSelection[0]]);
    },

    testDisabledSetSelection() {
      this._widget.setEnabled(false);
      this._testSetSelection([this._notInSelection[0]]);
    },

    _testSetSelection(selection) {
      var that = this;
      var widget = this._widget;

      this._selection = selection;

      // Tests that the event is fired and the event contains the right widget
      this.assertEventFired(
        widget,
        "changeSelection",
        function () {
          widget.setSelection(that._selection);
          that.flush();
        },
        function (event) {
          var data = event.getData();
          that._assertArrayEquals(
            that._selection,
            data,
            "The result of the" + " 'changeSelection' event is wrong!"
          );
        },
        "'changeSelection' event not fired!"
      );

      // Tests the result from "getSelection"
      var result = this._widget.getSelection();
      this._assertArrayEquals(
        this._selection,
        result,
        "The result of" + " 'getSelection' method is wrong!"
      );
    },

    testSameSetSelection() {
      var that = this;
      var widget = this._widget;

      this._assertArrayEquals(
        this._selection,
        this._widget.getSelection(),
        "The test setup is wrong!"
      );

      this.assertEventNotFired(
        widget,
        "changeSelection",
        function () {
          widget.setSelection(that._selection);
        },
        function (event) {},
        "'changeSelection' event fired!"
      );
    },

    testSetSelectionWithNotChildElement() {
      var testElement = this._createTestElement("Test Element");
      var that = this;

      this.assertException(
        function () {
          that._widget.setSelection([testElement]);
        },
        Error,
        null,
        "No error occurs by trying to select an element" +
          " which isn't a child element!"
      );

      testElement.destroy();
    },

    testSetSelectionWithTooMuchElements() {
      var newSelection = [this._selection[0], this._notInSelection[0]];
      var that = this;
      this.assertException(
        function () {
          that._widget.setSelection(newSelection);
        },
        Error,
        null,
        "It isn't possible to select more than one element!"
      );

      this._assertArrayEquals(
        this._selection,
        this._widget.getSelection(),
        "The wrong setSelection call has changed the old seclection!"
      );
    },

    testResetSelection() {
      var widget = this._widget;
      var that = this;

      //Tests that the event is fired and the event contains nothing
      this.assertEventFired(
        widget,
        "changeSelection",
        function () {
          widget.resetSelection();
          that.flush();
        },
        function (event) {
          if (that._mode === "one") {
            that._assertArrayEquals(
              [that._getChildren()[0]],
              event.getData(),
              "The first element isn't selected!"
            );
          } else {
            that.assertIdentical(
              0,
              event.getData().length,
              "Event isn't empty!"
            );
          }
        },
        "'changeSelection' event not fired!"
      );

      // Tests that no item is selected
      var result = this._widget.getSelection();
      if (this._mode === "one") {
        this._assertArrayEquals(
          [this._getChildren()[0]],
          result,
          "The first element isn't selected!"
        );
      } else {
        this.assertIdentical(0, result.length, "The result isn't empty!");
      }
    },

    testDisabledResetSelection() {
      this._widget.setEnabled(false);
      this.testResetSelection();
    },

    testResetSelectionWithEmptySelection() {
      var widget = this._widget;
      var that = this;

      //Tests that the event is fired and the event contains nothing
      this.assertEventFired(
        widget,
        "changeSelection",
        function () {
          widget.setSelection([]);
          that.flush();
        },
        function (event) {
          if (that._mode === "one") {
            that._assertArrayEquals(
              [that._getChildren()[0]],
              event.getData(),
              "The first element isn't selected!"
            );
          } else {
            that.assertIdentical(
              0,
              event.getData().length,
              "Event isn't empty!"
            );
          }
        },
        "'changeSelection' event not fired!"
      );

      // Tests that no item is selected
      var result = this._widget.getSelection();
      if (this._mode === "one") {
        this._assertArrayEquals(
          [this._getChildren()[0]],
          result,
          "The first element isn't selected!"
        );
      } else {
        this.assertIdentical(0, result.length, "The result isn't empty!");
      }
    },

    testIsSelected() {
      var result = this._widget.isSelected(this._selection[0]);
      this.assertTrue(result, "The wrong item is selected!");

      var notSelected = this._notInSelection[0];
      result = this._widget.isSelected(notSelected);
      this.assertFalse(result, "The wrong item is selected!");
    },

    testIsSelectedWithNotChildElement() {
      var testElement = this._createTestElement("Test Element");
      var that = this;

      this.assertException(
        function () {
          that._widget.isSelected(testElement);
        },
        Error,
        null,
        "No error occurs by calling 'isSelected' with an" +
          " element which isn't a child element!"
      );

      testElement.destroy();
    },

    testIsSelectionEmpty() {
      var result = this._widget.isSelectionEmpty();
      this.assertFalse(result, "The selection is empty!");

      this._widget.resetSelection();
      this.flush();

      result = this._widget.isSelectionEmpty();
      if (this._mode === "one") {
        this.assertFalse(result, "The selection is empty!");
      } else {
        this.assertTrue(result, "The selection isn't empty!");
      }
    },

    testGetSelectables() {
      var items = this._getChildren();
      var found = this._widget.getSelectables(true);

      this._assertArrayEquals(
        items,
        found,
        "This list of the returned selectables are wrong!"
      );
    },

    testDisabledGetSelectables() {
      this._widget.setEnabled(false);
      this.testGetSelectables();
    },

    testGetUserSelectables() {
      var selectables = [];
      var items = this._getChildren();

      for (var i = 0; i < items.length; i++) {
        if (i % 2 == 0) {
          selectables.push(items[i]);
        } else {
          items[i].setEnabled(false);
        }
      }

      var found = this._widget.getSelectables();

      this._assertArrayEquals(
        selectables,
        found,
        "This list of the returned selectables are wrong!"
      );
    }
  }
});
