/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */
qx.Class.define("qx.test.ui.toolbar.ToolBar",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testShow : function() {
      // setup toolbar with two buttons
      var toolbar = new qx.ui.toolbar.ToolBar();
      var buttons = [new qx.ui.toolbar.Button()];
      buttons.push(new qx.ui.toolbar.Button());
      for (var i=0; i < buttons.length; i++) {
        toolbar.add(buttons[i]);
      };

      // set a value and check if the buttons get synced
      toolbar.setShow("label");
      for (var i=0; i < buttons.length; i++) {
        this.assertEquals("label", buttons[i].getShow());
      };

      // add another button and check if the value has been applied
      buttons.push(new qx.ui.toolbar.Button());
      toolbar.add(buttons[2]);
      this.assertEquals("label", buttons[2].getShow());

      // dispose all widgets
      for (var i=0; i < buttons.length; i++) {
        buttons[i].dispose();
      };
      toolbar.dispose();
    }
  }
});
