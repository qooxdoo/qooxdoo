/* ************************************************************************

qooxdoo - the new era of web development

http://qooxdoo.org

Copyright:
  2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

License:
  LGPL: http://www.gnu.org/licenses/lgpl.html
  EPL: http://www.eclipse.org/org/documents/epl-v10.php
  See the LICENSE file in the project's top-level directory for details.

Authors:
  * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/*)

************************************************************************ */

qx.Class.define("qx.test.io.part.SafeScriptLoader",
{
  extend : qx.dev.unit.TestCase,
  include : qx.test.io.MRemoteTest,

  members :
  {
    "test: loading a singe script with callback should have status 'success'" : function()
    {
      var loader = new qx.io.part.SafeScriptLoader("file1");
      loader.load(this.getUrl("qx/test/part/file1-notify.js"), function(status) {
        this.resume(function() {
          this.assertEquals("success", status);
        }, this);  
      }, this);
      
      this.wait();
    },
    
    
    "test: loading a 404 page should have status 'fail'" : function()
    {
      if (this.isLocal()) {
        this.needsPHPWarning();
        return;
      }
      
      var loader = new qx.io.part.SafeScriptLoader("file1", 100);
      loader.load(this.getUrl("qx/test/xmlhttp/404.php"), function(status) {
        this.resume(function() {
          this.assertEquals("fail", status);
        }, this);  
      }, this);
      
      this.wait();
    }
  }
});