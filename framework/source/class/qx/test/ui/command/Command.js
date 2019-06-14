/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)
     * Mustafa Sak (msak)

************************************************************************ */
qx.Class.define("qx.test.ui.command.Command",
{
  extend : qx.dev.unit.TestCase,
  include : qx.dev.unit.MMock,

  members :
  {
    __cmd : null,
    __button : null,
    __toolbarButton : null,
    __menuButton : null,

    setUp : function()
    {
      this.__cmd = new qx.ui.command.Command();

      this.__button = new qx.ui.form.Button("a");
      this.__button.setCommand(this.__cmd);

      this.__toolbarButton = new qx.ui.toolbar.Button("b");
      this.__toolbarButton.setCommand(this.__cmd);

      this.__menuButton = new qx.ui.menu.Button("c");
      this.__menuButton.setCommand(this.__cmd);

      qx.locale.Manager.getInstance().setLocale("en");
    },


    tearDown : function()
    {
      this.__cmd.dispose();
      this.__button.destroy();
      this.__toolbarButton.destroy();
      this.__menuButton.destroy();

      qx.locale.Manager.getInstance().resetLocale();
    },


    testLabel : function()
    {
      // set a label
      this.__cmd.setLabel("a");
      this.assertEquals(this.__cmd.getLabel(), this.__button.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__toolbarButton.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__menuButton.getLabel());

      // set null
      this.__cmd.setLabel(null);
      this.assertEquals(this.__cmd.getLabel(), this.__button.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__toolbarButton.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__menuButton.getLabel());

      // set a second string
      this.__cmd.setLabel("b");
      this.assertEquals(this.__cmd.getLabel(), this.__button.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__toolbarButton.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__menuButton.getLabel());

      // reset
      this.__cmd.resetLabel();
      this.assertEquals(this.__cmd.getLabel(), this.__button.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__toolbarButton.getLabel());
      this.assertEquals(this.__cmd.getLabel(), this.__menuButton.getLabel());
    },


    testEnabled : function()
    {
      this.skip("Skipped because not relevant anymore");

      // set disabled
      this.__cmd.setEnabled(false);
      this.assertEquals(this.__cmd.getEnabled(), this.__button.getEnabled());
      this.assertEquals(this.__cmd.getEnabled(), this.__toolbarButton.getEnabled());
      this.assertEquals(this.__cmd.getEnabled(), this.__menuButton.getEnabled());

      // set enabled
      this.__cmd.setEnabled(true);
      this.assertEquals(this.__cmd.getEnabled(), this.__button.getEnabled());
      this.assertEquals(this.__cmd.getEnabled(), this.__toolbarButton.getEnabled());
      this.assertEquals(this.__cmd.getEnabled(), this.__menuButton.getEnabled());
    },


    testIcon : function()
    {
      // set a string
      this.__cmd.setIcon("a");
      this.assertEquals(this.__cmd.getIcon(), this.__button.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__toolbarButton.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__menuButton.getIcon());

      // set null
      this.__cmd.setIcon(null);
      this.assertEquals(this.__cmd.getIcon(), this.__button.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__toolbarButton.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__menuButton.getIcon());

      // set a second string
      this.__cmd.setIcon("b");
      this.assertEquals(this.__cmd.getIcon(), this.__button.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__toolbarButton.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__menuButton.getIcon());

      // reset
      this.__cmd.resetIcon();
      this.assertEquals(this.__cmd.getIcon(), this.__button.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__toolbarButton.getIcon());
      this.assertEquals(this.__cmd.getIcon(), this.__menuButton.getIcon());
    },


    testToolTipText : function()
    {
      // set a string
      this.__cmd.setToolTipText("a");
      this.assertEquals(this.__cmd.getToolTipText(), this.__button.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__toolbarButton.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__menuButton.getToolTipText());

      // set null
      this.__cmd.setIcon(null);
      this.assertEquals(this.__cmd.getToolTipText(), this.__button.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__toolbarButton.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__menuButton.getToolTipText());

      // set a second string
      this.__cmd.setIcon("b");
      this.assertEquals(this.__cmd.getToolTipText(), this.__button.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__toolbarButton.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__menuButton.getToolTipText());

      // reset
      this.__cmd.resetIcon();
      this.assertEquals(this.__cmd.getToolTipText(), this.__button.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__toolbarButton.getToolTipText());
      this.assertEquals(this.__cmd.getToolTipText(), this.__menuButton.getToolTipText());
    },


    testRemoveCommand : function()
    {
      // remove the command (has been set in the setUp method)
      this.__button.setCommand(null);
      this.__toolbarButton.setCommand(null);
      this.__menuButton.setCommand(null);

      // set a label
      this.__cmd.setLabel("x");
      // check if the label has been set
      this.assertEquals("a", this.__button.getLabel());
      this.assertEquals("b", this.__toolbarButton.getLabel());
      this.assertEquals("c", this.__menuButton.getLabel());
    },


    testValue : function()
    {
      var menuCheckBox = new qx.ui.menu.CheckBox();
      var menuRadioButton = new qx.ui.menu.RadioButton();
      var toggleButton = new qx.ui.form.ToggleButton();

      // set the command
      menuRadioButton.setCommand(this.__cmd);
      menuCheckBox.setCommand(this.__cmd);
      toggleButton.setCommand(this.__cmd);

      // set the value
      this.__cmd.setValue(true);
      this.assertEquals(this.__cmd.getValue(), menuCheckBox.getValue());
      this.assertEquals(this.__cmd.getValue(), menuRadioButton.getValue());
      this.assertEquals(this.__cmd.getValue(), toggleButton.getValue());

      // set the value
      this.__cmd.setValue(false);
      this.assertEquals(this.__cmd.getValue(), menuCheckBox.getValue());
      this.assertEquals(this.__cmd.getValue(), menuRadioButton.getValue());
      this.assertEquals(this.__cmd.getValue(), toggleButton.getValue());

      toggleButton.dispose();
      menuCheckBox.dispose();
      menuRadioButton.dispose();
    },


    testMenu : function()
    {
      var splitButton = new qx.ui.form.SplitButton();
      splitButton.setCommand(this.__cmd);

      var menu = new qx.ui.menu.Menu();

      // set the menu
      this.__cmd.setMenu(menu);
      this.assertEquals(menu, splitButton.getMenu());
      this.assertEquals(menu, this.__menuButton.getMenu());

      // reset the menu
      this.__cmd.resetMenu();
      this.assertNull(splitButton.getMenu());
      this.assertNull(this.__menuButton.getMenu());

      splitButton.dispose();
      menu.destroy();
    },


    testInit : function()
    {
      // check if the init values after setting the command was added
      this.assertEquals("a", this.__button.getLabel());
      this.assertEquals("b", this.__toolbarButton.getLabel());
      this.assertEquals("c", this.__menuButton.getLabel());

      // add a new command
      var cmd = new qx.ui.command.Command();
      cmd.setLabel("x");

      this.__button.setCommand(cmd);
      this.__toolbarButton.setCommand(cmd);
      this.__menuButton.setCommand(cmd);

      this.assertEquals(cmd.getLabel(), this.__button.getLabel());
      this.assertEquals(cmd.getLabel(), this.__toolbarButton.getLabel());
      this.assertEquals(cmd.getLabel(), this.__menuButton.getLabel());

      cmd.dispose();
    },

    testIconAsToolTipText : function() {
      // for [BUG #4534]
      var cmd = new qx.ui.command.Command("Control+D");
      cmd.setToolTipText("affe");

      var button1 = new qx.ui.form.Button("x", "y");
      button1.setCommand(cmd);

      this.assertEquals("affe", button1.getToolTipText());

      button1.dispose();
      cmd.dispose();
    },


    testDestructExecutable : function() {
      // Create the command
      var cmd = new qx.ui.command.Command("Meta+T");

      // Create a button linked to cmd
      var button = new qx.ui.form.Button("Command button", null,cmd);

      cmd.setEnabled(false);
      button.destroy();
      // make sure the dispose queue is flushed
      qx.ui.core.queue.Manager.flush();
      cmd.setEnabled(true);

      cmd.dispose();

      // test makes sure that code is running, no assert needed
    },

    testFireExecuteCount : function()
    {
      var handler = this.spy();

      // Create the command
      var cmd = new qx.ui.command.Command("Meta+T");
      cmd.addListener("execute", handler);

      cmd.setEnabled(false);
      cmd.setActive(false);
      cmd.execute();
      this.assertCallCount(handler, 0);

      cmd.setEnabled(true);
      cmd.setActive(false);
      cmd.execute();
      this.assertCallCount(handler, 0);


      cmd.setEnabled(true);
      cmd.setActive(true);
      cmd.execute();
      this.assertCallCount(handler, 1);

      cmd.dispose();
    },

    testGetShortcut : function() {
      // for bug #7036
      var cmd = new qx.ui.command.Command("Control+X");
      this.assertEquals('Control+X', cmd.getShortcut());
      cmd.dispose();
    },

    testShortCutToString : function() {
      // for bug #8465
      var cmd = new qx.ui.command.Command("Ctrl+X");
      this.assertEquals("Ctrl+X", cmd.toString());
      cmd.dispose();
      this.assertEquals("qx.ui.command.Command[undefined]",cmd.toString());
    }
  }
});
