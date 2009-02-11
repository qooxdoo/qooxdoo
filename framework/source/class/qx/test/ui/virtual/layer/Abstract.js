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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.Abstract",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    setUp : function()
    {
      this.layer = new qx.test.ui.virtual.layer.LayerMock();
      this.getRoot().add(this.layer);
    },

    
    tearDown : function() {
      this.layer.destroy();
    },
    
    
    assertCalls : function(methodNames, calls, msg)
    {
      this.assertEquals(methodNames.length, calls.length);
      for (var i=0; i<methodNames.length; i++) {
        this.assertEquals(methodNames[i], calls[i][0]);
      }
    },
    
    
    testInitialRendering : function()
    {
      this.assertCalls([], this.layer.calls);
      this.flush();
      this.assertCalls(["fullUpdate", "_fullUpdate"], this.layer.calls);
    }
  }
});
