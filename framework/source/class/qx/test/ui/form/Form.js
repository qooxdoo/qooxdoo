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
      // test for the default (false)
      this.assertFalse(widget.getRequired(), "Default required state is wrong.");

      widget.setRequired(true);
      
      // check if the state is set
      this.assertTrue(widget.getRequired(), "Setting of the required flag did not work.");
    },
    
    __testValid: function(widget) {
      this.getRoot().add(widget);
      
      // test for the default (true)
      this.assertTrue(widget.getValid(), "Default valid state is wrong.");
      this.assertFalse(!!widget.hasState("invalid"), "Should not have the invalid state.");

      widget.setValid(false);
      
      // check if the state is set
      this.assertFalse(widget.getValid(), "Setting of the valid flag did not work.");
      this.assertTrue(widget.hasState("invalid"), "Should have the invalid state.");
    
      qx.ui.core.queue.Manager.flush();
      
      // check for the invalid shadow
      this.assertEquals("border-invalid", widget.getDecorator(), "Shadow not set!");
      
      // check the focus
      widget.focus();
      qx.ui.core.queue.Manager.flush();
      this.assertEquals("input-focused-invalid", widget.getDecorator(), "Decorator not set!");
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
      this.__testRequired(new qx.ui.form.Slider());      
    },
    
    testValidTextField: function() {
     this.__testValid(new qx.ui.form.Slider()); 
    }    
    

    
  }
});