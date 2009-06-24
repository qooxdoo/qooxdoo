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
qx.Class.define("qx.test.ui.form.Form",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    
    __testRequired: function(widget) {
      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(widget.constructor, qx.ui.form.IForm), "Interface not implemented.");            
      // test for the default (false)
      this.assertFalse(widget.getRequired(), "Default required state is wrong.");

      // check for the event
      var self = this;
      widget.setRequired(false);
      this.assertEventFired(widget, "changeRequired", function () {
        widget.setRequired(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event!");
        self.assertFalse(e.getOldData(), "Wrong old data in the event!");        
      }, "Change event not fired!");
      
      // check if the state is set
      this.assertTrue(widget.getRequired(), "Setting of the required flag did not work.");
    },    

    __testValid: function(widget, where) {
      // check if the interface is implemented
      this.assert(qx.Class.hasInterface(widget.constructor, qx.ui.form.IForm), "Interface not implemented.");
      
      this.getRoot().add(widget);
      
      // test for the default (true)
      this.assertTrue(widget.getValid(), "Default valid state is wrong.");
      this.assertFalse(!!widget.hasState("invalid"), "Should not have the invalid state.");

      widget.setValid(false);
      
      // check if the state is set
      this.assertFalse(widget.getValid(), "Setting of the valid flag did not work.");
      this.assertTrue(widget.hasState("invalid"), "Should have the invalid state.");
      
      // check for the event
      var self = this;
      this.assertEventFired(widget, "changeValid", function () {
        widget.setValid(true);
      }, function(e) {
        self.assertTrue(e.getData(), "Wrong data in the event.");
        self.assertFalse(e.getOldData(), "Wrong old data in the event.");        
      }, "Change event not fired!");
      
      // check for the event
      this.assertEventFired(widget, "changeInvalidMessage", function () {
        widget.setInvalidMessage("affe");
      }, function(e) {
        self.assertEquals("affe", e.getData(), "Wrong data in the event.");
        self.assertNull(e.getOldData(), "Wrong old data in the event.");
      }, "Change event not fired!");      
      
      // set the widget to invalid
      widget.setValid(false);
         
      if (where == "shadow") {        
        this.__testInvalidShadow(widget);     
      } else if (where == "dont") {
        // ignore thiese tests         
      } else {
        // needs to be tests async because of a strange behavior in opera 9
        var self = this;
        window.setTimeout(function() {
          self.resume(function() {
            this.__testInvalidBorder(widget);
          }, self);
        }, 0);
        this.wait();
      }
    },    
    
    
    __testInvalidBorder: function(widget) {      
      this.flush();

      // check for the invalid decorator
      this.assertEquals("border-invalid", widget.getDecorator(), "Decorator not set!");      
      
      // check the focus
      widget.focus();
      this.flush();
      this.assertEquals("input-focused-invalid", widget.getDecorator(), "Decorator not set!");      
    },
    
    
    __testInvalidShadow: function(widget) {      
      this.flush();
      
      // check for the invalid shadow
      this.assertMatch(widget.getShadow(), new RegExp("-invalid-shadow$") ,"Shadow not set!");
    },    
    
    
    
    testRequieredSpinner: function() {
      this.__testRequired(new qx.ui.form.Spinner());      
    },
    
    testValidSpinner: function() {
     this.__testValid(new qx.ui.form.Spinner()); 
    },
    
    testRequieredSlider: function() {
      this.__testRequired(new qx.ui.form.Slider());      
    },
    
    testValidSlider: function() {
     this.__testValid(new qx.ui.form.Slider()); 
    },
    
    testRequieredTextField: function() {
      this.__testRequired(new qx.ui.form.TextField());      
    },
    
    testValidTextField: function() {
     this.__testValid(new qx.ui.form.TextField()); 
    },
    
    testRequieredTextArea: function() {
      this.__testRequired(new qx.ui.form.TextArea());      
    },
    
    testValidTextArea: function() {
     this.__testValid(new qx.ui.form.TextArea()); 
    },
    
    testRequieredPasswordField: function() {
      this.__testRequired(new qx.ui.form.PasswordField());      
    },
    
    testValidPasswordField: function() {
     this.__testValid(new qx.ui.form.PasswordField()); 
    },
    
    testRequieredComboBox: function() {
      this.__testRequired(new qx.ui.form.ComboBox());      
    },
    
    testValidComboBox: function() {
     this.__testValid(new qx.ui.form.ComboBox()); 
    },
    
    testRequieredSelectBox: function() {
      this.__testRequired(new qx.ui.form.SelectBox());      
    },
    
    testValidSelectBox: function() {
     this.__testValid(new qx.ui.form.SelectBox(), "shadow"); 
    },
    
    testRequieredCheckBox: function() {
      this.__testRequired(new qx.ui.form.CheckBox());      
    },
    
    testValidCheckBox: function() {
     this.__testValid(new qx.ui.form.CheckBox(), "dont"); 
    },
    
    testValidRadioButton: function() {
     this.__testValid(new qx.ui.form.RadioButton(), "dont"); 
    },
    
    testRequieredRadioButton: function() {
      this.__testRequired(new qx.ui.form.RadioButton());      
    },
    
    testValidGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.GroupBox(), "dont"); 
    },
    
    testRequieredGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.GroupBox());      
    },
    
    testValidRadioGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.RadioGroupBox(), "dont"); 
    },
    
    testRequieredRadioGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.RadioGroupBox());      
    },
    
    testValidCheckGroupBox: function() {
     this.__testValid(new qx.ui.groupbox.CheckGroupBox(), "dont"); 
    },
    
    testRequieredCheckGroupBox: function() {
      this.__testRequired(new qx.ui.groupbox.CheckGroupBox());      
    },
    
    testValidList: function() {
     this.__testValid(new qx.ui.form.List()); 
    },
    
    testRequieredList: function() {
      this.__testRequired(new qx.ui.form.List());      
    },
    
    testRequieredDateField: function() {
      this.__testRequired(new qx.ui.form.DateField());      
    },
    
    testValidDateField: function() {
     this.__testValid(new qx.ui.form.DateField()); 
    },
    
    testRequieredDateChooser: function() {
      this.__testRequired(new qx.ui.form.DateField());      
    },
    
    testValidDateChooser: function() {
     this.__testValid(new qx.ui.form.DateField()); 
    }        
    
    
    
  }
});