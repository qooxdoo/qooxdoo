/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

qx.Class.define("qx.test.mobile.navigationbar.NavigationBar",
{
  extend : qx.test.mobile.MobileTestCase,

  members :
  {
    testCreate : function()
    {
      var bar = new qx.ui.mobile.navigationbar.NavigationBar();
      this.getRoot().add(bar);

      var back = new qx.ui.mobile.navigationbar.BackButton("Back");
      bar.add(back);

      var title = new qx.ui.mobile.navigationbar.Title("Title");
      bar.add(title);

      var button = new qx.ui.mobile.navigationbar.Button("Action");
      bar.add(button);

      this.assertEquals(3, bar.getChildren().length);

      back.destroy();
      title.destroy();
      button.destroy();
      bar.destroy();
    }
  }

});
