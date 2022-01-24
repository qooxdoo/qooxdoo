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

qx.Class.define("qx.test.ui.selection.RadioGroup", {
  extend: qx.test.ui.selection.AbstractSingleSelectonTest,

  members: {
    __radioButtons: null,

    setUp() {
      var length = 10;
      this._mode = "one";
      this.__radioButtons = [];
      this._notInSelection = [];

      this._widget = new qx.ui.form.RadioGroup();
      var root = this.getRoot();

      for (var i = 0; i < length; i++) {
        var item = new qx.ui.form.RadioButton("RadioButton" + i);
        root.add(item, { top: 20 * i });
        this._widget.add(item);
        this.__radioButtons.push(item);

        if (i == 5) {
          this._widget.setSelection([item]);
          this._selection = [item];
        } else {
          this._notInSelection.push(item);
        }
      }

      this.flush();
    },

    tearDown() {
      super.tearDown();
      for (var i = 0; i < this.__radioButtons.length; i++) {
        this.__radioButtons[i].destroy();
      }
      this.__radioButtons = null;
      this._widget.dispose();
      this._widget = null;
      this._selection = null;
      this._notInSelection = null;
      this.flush();
    },

    _getChildren() {
      if (this._widget != null) {
        return this._widget.getItems();
      } else {
        return [];
      }
    },

    _createTestElement(name) {
      return new qx.ui.form.RadioButton(name);
    },

    testAllowEmptySelection() {
      this._mode = "";
      this._widget.setAllowEmptySelection(true);
      this.testResetSelection();

      this._widget.setAllowEmptySelection(false);

      var result = this._widget.getSelection();
      this._assertArrayEquals(
        [this._widget.getSelectables()[0]],
        result,
        "The result of 'getSelection' method is wrong!"
      );
    },

    testAdd() {
      var widget = new qx.ui.form.RadioGroup();
      var item = new qx.ui.form.RadioButton("RadioButton");
      widget.add(item);

      var result = widget.getSelection();
      this._assertArrayEquals(
        [widget.getSelectables()[0]],
        result,
        "The result of 'getSelection' method is wrong!"
      );

      widget.dispose();
      item.destroy();
    },

    testAddWithAllowEmptySelection() {
      var widget = new qx.ui.form.RadioGroup();
      widget.setAllowEmptySelection(true);

      var item = new qx.ui.form.RadioButton("RadioButton");
      widget.add(item);

      var result = widget.getSelection();
      this.assertEquals(
        0,
        result.length,
        "The result of 'getSelection' method is wrong!"
      );

      widget.dispose();
      item.destroy();
    },

    testSetGroup() {
      var radioButton1 = new qx.ui.form.RadioButton();
      var radioButton2 = new qx.ui.form.RadioButton();

      var radioGroup = new qx.ui.form.RadioGroup();

      radioButton1.setGroup(radioGroup);
      radioButton2.setGroup(radioGroup);

      this.assertEquals(
        radioButton1,
        radioGroup.getItems()[0],
        "First button not in the group."
      );

      this.assertEquals(
        radioButton2,
        radioGroup.getItems()[1],
        "Second button not in the group."
      );

      radioGroup.dispose();
      radioButton2.dispose();
      radioButton1.dispose();
    }
  }
});
