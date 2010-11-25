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
    
    testInitial: function(){
      var button = this.__button;
      this.assertIdentical(false, button.getValue());
    },
    
    testChecked: function(){
      var button = this.__button;
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertIdentical(true, button.getValue());
        }, this)
      }, this);
      
      this.executeOn(button);
      this.wait();
    },
    
    testUnchecked: function() {
      var button = this.__button;
      button.setValue(true);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertIdentical(false, button.getValue());
        }, this)
      }, this);
      
      this.executeOn(button);
      this.wait();
    },
    
    testToggle: function(attribute){
      var button = this.__button;
      this.immediateExecuteOn(button);
      
      button.addListener("execute", function() {
        this.resume(function() {
          this.assertIdentical(false, button.getValue());
        }, this)
      }, this);
      
      this.executeOn(button);
      this.wait();
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
