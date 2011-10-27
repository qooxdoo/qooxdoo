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
     * Martin Wittemann (martinwittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.form.Label",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __formWidget: null,
    __label: null,

    setUp : function()
    {
      this.__label = new qx.ui.basic.Label("abc");
    },

    tearDown : function()
    {
      this.__label.destroy();
      this.__formWidget.destroy();
    },


    __testEnabled: function() {
      this.__label.setBuddy(this.__formWidget);

      // check the inital enabled state
      this.assertTrue(this.__formWidget.getEnabled(), "Form widget is disabled.");
      this.assertTrue(this.__label.getEnabled(), "Label widget is disabled.");

      // disable the textfield. Label should be disabled too
      this.__formWidget.setEnabled(false);

      // check if both are disabled
      this.assertFalse(this.__formWidget.getEnabled(), "Form widget is not disabled.");
      this.assertFalse(this.__label.getEnabled(), "Label widget is not disabled.");

      // enabled the label, textfield should stay
      this.__label.setEnabled(true);

      // check if the enabled properties are still correct
      this.assertFalse(this.__formWidget.getEnabled(), "Form widget is not disabled at the end.");
      this.assertTrue(this.__label.getEnabled(), "Label widget is ensabled at the end.");
    },


    __testEnabledRemove: function() {
      this.__label.setBuddy(this.__formWidget);

      // disable the textfield. Label should be disabled too
      this.__formWidget.setEnabled(false);

      // check if both are disabled
      this.assertFalse(this.__formWidget.getEnabled(), "Form widget is not disabled.");
      this.assertFalse(this.__label.getEnabled(), "Label widget is not disabled.");

      // remove the buddy
      this.__label.setBuddy(null);
      // enabled the textfield. label should stay
      this.__formWidget.setEnabled(true);

      // check if the enabled properties are still correct
      this.assertFalse(this.__label.getEnabled(), "Label widget is not disabled at the end.");
      this.assertTrue(this.__formWidget.getEnabled(), "Form widget is ensabled at the end.");
    },


    __testFocus: function() {
      // NEEDED FOR THE FOCUS
      this.getRoot().add(this.__formWidget);

      this.__label.setBuddy(this.__formWidget);

      this.__formWidget.addListener("focus", function() {
        this.resume(function() {
          // do nothing. Just check for the event
        }, this);
      }, this);

      this.clickOn(this.__label);

      this.wait();
    },


    __testFocusRemove: function() {
      // NEEDED FOR THE FOCUS
      this.getRoot().add(this.__formWidget);

      this.__label.setBuddy(this.__formWidget);
      this.__label.setBuddy(null);

      var focused = false;
      this.__formWidget.addListener("focus", function() {
        focused = true;
      }, this);

      var self = this;
      window.setTimeout(function() {
        self.resume(function() {
          this.assertFalse(self.__label.hasListener("click"), "Listener still there.");
          this.assertFalse(focused, "Element has been focused");
        }, self);
      }, 1000);

      this.clickOn(this.__label);

      this.wait();
    },


    testEnabledRemoveTextField: function() {
      this.__formWidget = new qx.ui.form.TextField("abc");
      this.__testEnabledRemove();
    },


    testEnabledTextField: function() {
      this.__formWidget = new qx.ui.form.TextField("abc");
      this.__testEnabled();
    },


    testEnabledRemoveSpinner: function() {
      this.__formWidget = new qx.ui.form.Spinner();
      this.__testEnabledRemove();
    },


    testEnabledSpinner: function() {
      this.__formWidget = new qx.ui.form.Spinner();
      this.__testEnabled();
    },


    testEnabledRemoveCheckBox: function() {
      this.__formWidget = new qx.ui.form.CheckBox();
      this.__testEnabledRemove();
    },


    testEnabledCheckBox: function() {
      this.__formWidget = new qx.ui.form.CheckBox();
      this.__testEnabled();
    },


    testFocusTextField: function() {
      this.__formWidget = new qx.ui.form.TextField("abc");
      this.__testFocus();
    },


    testFocusSpinner: function() {
      this.__formWidget = new qx.ui.form.Spinner();
      this.__testFocus();
    },


    testFocusCheckBox: function() {
      this.__formWidget = new qx.ui.form.CheckBox();
      this.__testFocus();
    },


    testFocusRemoveTextField: function() {
      this.__formWidget = new qx.ui.form.TextField("abc");
      this.__testFocusRemove();
    },


    testFocusRemoveSpinner: function() {
      this.__formWidget = new qx.ui.form.Spinner();
      this.__testFocusRemove();
    },


    testFocusRemoveCheckBox: function() {
      this.__formWidget = new qx.ui.form.CheckBox();
      this.__testFocusRemove();
    },


    testFocusNotFocusableTextField : function() {
      this.__formWidget = new qx.ui.form.TextField();
      this.__formWidget.setReadOnly(true);
      this.__label.setBuddy(this.__formWidget);

      this.clickOn(this.__label);
    }

  },

  destruct : function() {
    this.__label = this.__formWidget = null;
  }
});