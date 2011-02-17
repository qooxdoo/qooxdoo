/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.form.ComboBox",
{
  extend : qx.test.ui.LayoutTestCase,

  include : qx.dev.unit.MMock,

  members :
  {
    testWithSetValueWithArbitraryValue: function() {
      var combobox = this.__createComboBox("arbitrary value");
      this.getRoot().add(combobox);
      this.flush();

      this.assertIdentical("arbitrary value", combobox.getValue(),
        "Wrong result from getValue()");

      combobox.open();
      this.flush();

      this.assertIdentical(0, combobox.getChildrenContainer().getSelection().length,
        "The pop-up list has an item selected!");

      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
    },

    testWithSetValueWith: function() {
      var combobox = this.__createComboBox("Item 0");
      this.getRoot().add(combobox);
      this.flush();

      this.assertIdentical("Item 0", combobox.getValue(),
        "Wrong result from getValue()");

      combobox.open();
      this.flush();

      var list = combobox.getChildrenContainer();
      var item = list.findItem("Item 0");
      this.assertIdentical(item, list.getSelection()[0],
        "The wrong item selected in pop-up list!");

      // check if the combobox is case sensitive, [BUG #3024]
      combobox.setValue("item 2");
      this.assertEquals("item 2", combobox.getValue());
      this.assertEquals(0, list.getSelection().length);

      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
    },

    testWithoutSetValue: function() {
      var combobox = this.__createComboBox();
      this.getRoot().add(combobox);
      this.flush();

      this.assertIdentical(null, combobox.getValue(),
        "Wrong result from getValue()");

      combobox.open();
      this.flush();

      this.assertIdentical(0, combobox.getChildrenContainer().getSelection().length,
        "The pop-up list has an item selected!");

      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
    },

    testFocusTextOnClose: function() {
      var combobox = this.__createComboBox();
      this.getRoot().add(combobox);
      this.flush();

      // Open list popup
      combobox.open();
      this.flush();

      // Select item
      var list = combobox.getChildControl("list");
      var item = list.findItem("Item 0");
      list.setSelection([item]);
      this.flush();

      // Asssert focus on close
      this.spy(combobox, "tabFocus");
      combobox.close();
      this.assertCalled(combobox.tabFocus);

      this.getRoot().removeAll();
      combobox.dispose();
    },

    testNotFocusTextOnCloseWhenInvisibleBefore: function() {
      var combobox = this.__createComboBox();
      this.getRoot().add(combobox);
      this.flush();

      // Enter value
      combobox.setValue("Item 0");
      this.flush();

      // Assert not focus on close
      this.spy(combobox, "tabFocus");
      combobox.close();
      this.assertNotCalled(combobox.tabFocus);

      this.getRoot().removeAll();
      combobox.dispose();
    },

    __createComboBox : function(initValue)
    {
      var comboBox = new qx.ui.form.ComboBox();

      if (initValue) {
        comboBox.setValue(initValue);
      }

      for (var i = 0; i < 10; i++) {
        comboBox.add(new qx.ui.form.ListItem("Item " + i));
      }

      return comboBox;
    }

  }
});