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
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.form.MenuButton",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    __menu : null,

    __menuButton : null,

    setUp : function()
    {
      this.base(arguments);

      this.__menu = new qx.ui.menu.Menu();
      this.__menu.add(new qx.ui.menu.Button("Undo"));
      this.__menu.add(new qx.ui.menu.Button("Redo"));
      this.__menu.add(new qx.ui.menu.Button("Cut"));

      this.__menuButton = new qx.ui.form.MenuButton("Menu Button", null, this.__menu);

      this.getRoot().add(this.__menuButton);
      this.flush();
    },

    tearDown : function()
    {
      this.base(arguments);

      var buttons = this.__menu.getChildren();
      for (var i = 0; i < buttons.length; i++) {
        buttons[i].dispose();
      }
      this.__menu.dispose();
      this.__menuButton.dispose();

      this.flush();
    },

    testOpen: function() {
      this.__menuButton.open();
      this.assertTrue(this.__menu.isVisible());
      this.assertNull(this.__menu.getSelectedButton());

      qx.ui.menu.Manager.getInstance().hideAll();
      this.assertFalse(this.__menu.isVisible());
    },

    testOpenSelectFirst: function() {
      this.__menuButton.open(true);
      this.assertTrue(this.__menu.isVisible());
      this.assertEquals(this.__menu.getChildren()[0], this.__menu.getSelectedButton());

      qx.ui.menu.Manager.getInstance().hideAll();
      this.assertFalse(this.__menu.isVisible());
    },

    testOpenSelectFirstWithDisabledElement: function() {
      this.__menu.getChildren()[0].setEnabled(false);

      this.__menuButton.open(true);
      this.assertTrue(this.__menu.isVisible());
      this.assertEquals(this.__menu.getChildren()[1], this.__menu.getSelectedButton());

      qx.ui.menu.Manager.getInstance().hideAll();
      this.assertFalse(this.__menu.isVisible());
    }
  }
});