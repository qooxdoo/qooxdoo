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

************************************************************************ */

qx.Class.define("qx.test.bom.History", {

  extend : qx.dev.unit.TestCase,
  
  members :
  {
    __history : null,


    setUp : function()
    {
      this.__history = qx.bom.History.getInstance();
    },


    testInstance : function()
    {
      if (qx.core.Environment.get("event.hashchange")) {
        this.assertInstance(this.__history, qx.bom.NativeHistory);
      }
      else if (qx.core.Environment.get("engine.name") == "mshtml") {
        this.assertInstance(this.__history, qx.bom.IframeHistory);
      }
    },


    testNavigateBack : function()
    {
      this.__history.addToHistory("foo", "Title Foo");
      this.assertEquals("#foo", window.location.hash);
      this.assertEquals("Title Foo", document.title);
      this.__history.addToHistory("bar", "Title Bar");
      this.__history.navigateBack();
      var self = this;
      //navigateBack is async
      window.setTimeout(function() {
        self.resume(function() {
          this.assertEquals("#foo", window.location.hash);
          this.assertEquals("Title Foo", document.title);
        }, self);
      }, 250);
      
      this.wait();
    }
  }
});