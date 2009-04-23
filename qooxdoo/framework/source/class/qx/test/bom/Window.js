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
     * Alexander Back (aback)

************************************************************************ */

qx.Class.define("qx.test.bom.Window",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testOpen : function()
    {
      var win = qx.bom.Window.open("http://qooxdoo.org");
      this.assertFalse(win.closed);
      win.close();
    },
    
    testClose : function()
    {
      var win = qx.bom.Window.open("http://qooxdoo.org");
      qx.bom.Window.close(win);
      this.assertTrue(qx.bom.Window.isClosed(win));
    },
    
    testIsClosed : function()
    {
      var win = qx.bom.Window.open("http://qooxdoo.org");
      this.assertFalse(qx.bom.Window.isClosed(win));
      win.close();
      
      var win2 = qx.bom.Window.open("http://qooxdoo.org");
      win2.close();
      this.assertTrue(qx.bom.Window.isClosed(win2));
    }
  }
});
