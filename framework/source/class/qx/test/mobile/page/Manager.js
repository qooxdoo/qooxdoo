/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.page.Manager",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testCreate : function()
    {
      var manager = new qx.ui.mobile.page.Manager();
      manager.dispose();
    },


    testAdd : function() {
      var manager = new qx.ui.mobile.page.Manager();
      var page = new qx.ui.mobile.page.Page();
      manager.addMaster([page]);
      manager.addDetail([page]);
      manager.dispose();
    }
  }

});
