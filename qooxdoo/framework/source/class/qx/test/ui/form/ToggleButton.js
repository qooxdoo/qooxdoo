/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.test.ui.form.ToggleButton", 
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __button : null,
    
    setUp : function() 
    {
      var button = this.__button = new qx.ui.form.ToggleButton;
      this.getRoot().add(button);
      this.flush();
    },
    
    //
    // 2-state button
    //
    
    testInitial: function(){
      var button = this.__button;
      this.assertFalse(button.getValue());
      this.assertNotState(button, "checked");
      this.assertNotState(button, "undetermined");
    },
    
    testCheck: function(){
      var button = this.__button;
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertTrue(button.getValue());
          this.assertState(button, "checked");
        }, this);
      }, this);
      
      this.executeOn(button);
      this.wait();
    },
    
    testUncheck: function() {
      var button = this.__button;
      button.setValue(true);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertFalse(button.getValue());
          this.assertNotState(button, "checked");
        }, this);
      }, this);
      
      this.executeOn(button);
      this.wait();
    },
    
    testToggle: function(attribute){
      var button = this.__button;
      
      // Check
      this.immediateExecuteOn(button);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertFalse(button.getValue());
          this.assertNotState(button, "checked");
          this.assertNotState(button, "undetermined");
        }, this);
      }, this);
      
      // Uncheck
      this.executeOn(button);
      
      this.wait();
    },
    
    //
    // 3-state button
    //
    
    testInitialTri: function(attribute){
      var button = this.__button;
      button.setTriState(true);
      
      this.assertFalse(button.getValue());
      this.assertState(button, "undetermined");
      this.assertNotState(button, "checked");
    },
    
    testCheckTri: function(){
      var button = this.__button;
      button.setTriState(true);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertTrue(button.getValue());
          this.assertState(button, "checked");
          this.assertNotState(button, "undetermined");
        }, this);
      }, this);
      
      this.executeOn(button);
      this.wait();
    },
    
    testDoubleCheckTri: function() {
      var button = this.__button;
      button.setTriState(true);
      
      // Check
      this.executeOn(button);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertTrue(button.getValue());
          this.assertState(button, "checked");
          this.assertNotState(button, "undetermined");
        }, this);
      }, this);
      
      // Uncheck
      this.executeOn(button);
      
      this.wait();
    },
    
    testTripleCheckTri: function() {
      var button = this.__button;
      button.setTriState(true);
      
      // Check
      this.executeOn(button);
      
      // Uncheck
      this.executeOn(button);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertFalse(button.getValue());
          this.assertState(button, "undetermined");
          this.assertNotState(button, "checked");
        }, this);
      }, this);
      
      // Reset
      this.executeOn(button);
      
      this.wait();
    },
    
    //
    // Helper methods
    //
    
    assertState: function(widget, state) {
      this.assertTrue(widget.hasState(state), "State " + state + " not set");
    },
    
    assertNotState: function(widget, state) {
      this.assertFalse(widget.hasState(state), "State " + state + " is set");
    },
    
    executeOn: function(widget) {
      var that = this;
      window.setTimeout(function() {
        that.immediateExecuteOn(widget);
      })
    },
    
    immediateExecuteOn : function(widget) {
      widget.fireEvent("execute", qx.event.type.Event, [false, true]);
    },
    
    tearDown : function() 
    {
      this.__button.destroy();
    }
  }
});
