/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2017 Martijn Evers, The Netherlands

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martijn Evers (mever)

************************************************************************ */
qx.Class.define("qx.test.ui.form.VirtualSelectBox",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.__selectBox = new qx.ui.form.VirtualSelectBox();
      this.getRoot().add(this.__selectBox);

      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);
      this.__selectBox.destroy();
      this.__selectBox = null;
    },

    __simulateUiInteraction : function() {
      // focus -> array key down -> array key down -> enter
      this.__selectBox.getSelection().setItem(0, this.__selectBox.getModel().getItem(1));
    },

    testChangeValueEvent : function()
    {
      var m = qx.data.marshal.Json.createModel(["a", "b"]);

      this.__selectBox.addListenerOnce("changeValue", function(e) {
        this.assertIdentical("a", e.getData());
        this.assertNull(e.getOldData());
      }.bind(this));

      this.__selectBox.setModel(m);

      this.__selectBox.addListenerOnce("changeValue", function(e) {
        this.assertIdentical("b", e.getData());
        this.assertIdentical("a", e.getOldData());
      }.bind(this));

      this.__simulateUiInteraction();
    },

    testChangeModelWhileNotVisible : function()
    {
      "use strict";
      var selectBox = new qx.ui.form.VirtualSelectBox(); // We don't want to use a selectbox that has been added to a layout item.
      selectBox.setLabelPath('b');
      var items = qx.data.marshal.Json.createModel([{
        a: 123,
        b: 'item 1'
      }, {
        a: 456,
        b: 'item 2'
      }]);
      items.setAutoDisposeItems(true);

      selectBox.setModel(items);
      try {
        items.pop();
      } catch (e) {
        this.assertTrue(false, "Changing the model should not cause an exception in VirtualDropDownList#_getAvailableHeight");
      }

      items.dispose();
    },

    "test dropdown list same width as selectbox" : function () {
      "use strict";
      var test = this;
      var m = qx.data.marshal.Json.createModel([
        "asdddddddddddddddddddddddddddddddddddddddddddddddddddd",
        "dsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      ]);

      this.__selectBox.setAllowGrowDropDown(false);
      this.__selectBox.setModel(m);
      this.__selectBox.setWidth(150);

      this.__selectBox.open();
      this.flush();

      setTimeout(function () {
        test.assertIdentical(test.__selectBox.getWidth(), test.__selectBox.getBounds().width);
        test.assertIdentical(test.__selectBox.getWidth(), test.__selectBox.getChildControl('dropdown').getBounds().width);
        test.resume();
      }, 10);

      this.wait();
    },

    "test dropdown list wider than selectbox" : function () {
      "use strict";
      var test = this;
      var m = qx.data.marshal.Json.createModel([
        "asddddddddddddddddddddddddddddddddddddddddddddddddddddasddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        "dsaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
      ]);

      this.__selectBox.setAllowGrowDropDown(true);
      this.__selectBox.setModel(m);
      this.__selectBox.setWidth(150);

      this.__selectBox.open();
      this.flush();

      setTimeout(function () {
        test.assertIdentical(test.__selectBox.getWidth(), test.__selectBox.getBounds().width);
        test.assertTrue(test.__selectBox.getChildControl('dropdown').getBounds().width > 666, "dropdown could not fit the whole item");
        test.resume();
      }, 10);

      this.wait();
    }
  }
});
