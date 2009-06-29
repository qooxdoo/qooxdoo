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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.form.ComboBox",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testWithoutSetValue: function() {
      var combobox = this.__createComboBox("arbitrary value");
      this.getRoot().add(combobox);
      this.flush();
      
      this.assertIdentical("arbitrary value", combobox.getValue());
      
      combobox.open();
      this.flush();
      
      this.assertIdentical(0, combobox.getChildrenContainer().getSelection().length);
      
      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
    },
    
    testSetValue: function() {
      var combobox = this.__createComboBox();
      this.getRoot().add(combobox);
      this.flush();
      
      this.assertIdentical("Item 0", combobox.getValue());
      
      combobox.open();
      this.flush();
      
      var list = combobox.getChildrenContainer();
      var item = list.findItem("Item 0");
      this.assertIdentical(item, list.getSelection()[0]);
      
      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
    },
    
    testGetValue : function() {
      var combobox = new qx.ui.form.ComboBox();
      combobox.add(new qx.ui.form.ListItem("Test1"));
      this.getRoot().add(combobox);
      this.flush();
      
      this.assertIdentical("Test1", combobox.getValue());
      
      combobox.removeAll();
      combobox.add(new qx.ui.form.ListItem("Test2"));
      this.flush();

      this.assertIdentical("Test1", combobox.getValue());

      combobox.removeAll();
      combobox.setValue("");
      combobox.add(new qx.ui.form.ListItem("Test3"));
      this.flush();

      this.assertIdentical("Test3", combobox.getValue());
            
      this.getRoot().removeAll();
      combobox.dispose();
      this.flush();
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