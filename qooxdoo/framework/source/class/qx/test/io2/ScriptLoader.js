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

/*
#asset(qx/test/*)
*/

qx.Class.define("qx.test.io2.ScriptLoader",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testLoadError : function()
    {
      // Opera will fire no event at all
      if (qx.bom.client.Engine.OPERA) {
        return;
      }
      
      var loader = new qx.io2.ScriptLoader();
      loader.load("http://qooxdoo.org/foo.js", function(status)
      {
        this.resume(function()
        {
          var isSafari3 = qx.bom.client.Engine.WEBKIT && qx.bom.client.Engine.VERSION < 530;
          
          if (qx.bom.client.Engine.MSHTML || isSafari3) {
            // Error state does not work in IE!
            this.assertEquals("success", status);
          } else {
            this.assertEquals("fail", status);
          }
        }, this);
      }, this);
      
      this.wait();
    }
  }
});