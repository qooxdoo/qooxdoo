/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Daniel Wagner (danielwagner)
     * Mustafa Sak (msak)

************************************************************************ */

qx.Class.define("qx.test.bom.History", {

  extend : qx.dev.unit.TestCase,
  
  include : [qx.dev.unit.MRequirements],
  
  members :
  {
    __history : null,


    hasNoIe : function()
    {
      return qx.core.Environment.get("engine.name") !== "mshtml";
    },


    setUp : function()
    {
      this.__history = qx.bom.History.getInstance();
    },


    testInstance : function()
    {
      if (!(window == window.top) && qx.core.Environment.get("engine.name") == "mshtml") {
        this.assertInstance(this.__history, qx.bom.HashHistory);
      }
      else if (qx.core.Environment.get("event.hashchange")) {
        this.assertInstance(this.__history, qx.bom.NativeHistory);
      }
      else if (qx.core.Environment.get("engine.name") == "mshtml") {
        this.assertInstance(this.__history, qx.bom.IframeHistory);
      }
    },


    testAddState : function()
    {
      this.__history.addToHistory("foo", "Title Foo");
      
      var self = this;
      window.setTimeout(function() {
        self.resume(function() {
          this.assertEquals("foo", this.__history.getState(), "AFFE1");
          this.assertEquals("Title Foo", this.__history.getTitle());
        }, self);
      }, 100);
      
      this.wait();
    },
    
    
    testNavigateBack : function()
    {
      // navigateBack causes the AUT to reload in IE
      //this.require(["noIe"]);
      this.__history.addToHistory("foo", "Title Foo");
      this.__history.addToHistory("bar", "Title Bar");
      this.__history.navigateBack();
      var self = this;
      //navigateBack is async
      window.setTimeout(function() {
        self.resume(function() {
          this.assertEquals("foo", this.__history.getState(), "AFFE2");
          this.assertEquals("Title Foo", this.__history.getTitle());
        }, self);
      }, 500);
      
      this.wait();
    }
  }
});